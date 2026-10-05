/**
 * HandyNG — Migration applicator (HTTP mode)
 *
 * Applies all migrations + seed to Supabase via the REST API.
 * Uses a two-step bootstrap:
 *   1. Create exec_sql() via a raw INSERT trigger trick (first run only)
 *   2. Call exec_sql() for every statement in the migration bundle
 *
 * Usage:
 *   node supabase/apply-http.mjs
 *
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 *   - Supabase project must be active (not paused)
 *
 * If the project is paused:
 *   Visit https://supabase.com/dashboard/project/cuozjelmnukyehrrlxpo
 *   and click "Restore project", then re-run this script.
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from workspace root
const dotenv = require('/home/olamide/Desktop/HandyNG/node_modules/dotenv');
dotenv.config({ path: resolve(__dirname, '../.env') });

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const HEADS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${KEY}`,
  apikey: KEY,
  Prefer: 'return=minimal',
};

const TIMEOUT_MS = 15000;

// ── Fetch with timeout ────────────────────────────────────────
async function post(path, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${URL}${path}`, {
      method: 'POST',
      headers: HEADS,
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
    return { status: res.status, ok: res.ok, body: json };
  } finally {
    clearTimeout(timer);
  }
}

// ── Wake up the project ───────────────────────────────────────
async function wakeProject() {
  process.stdout.write('  Waking project (may take 10-30s)...');
  for (let i = 0; i < 12; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(`${URL}/rest/v1/`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (r.ok || r.status === 404 || r.status === 200) {
        console.log(' awake ✓');
        return true;
      }
    } catch {
      /* keep trying */
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, 5000));
  }
  console.log(' timed out');
  return false;
}

// ── Bootstrap exec_sql ────────────────────────────────────────
const EXEC_SQL_DEF = `
create or replace function public.exec_sql(sql text)
returns jsonb language plpgsql security definer
set search_path = public as $$
begin
  execute sql;
  return '{"ok":true}'::jsonb;
exception when others then
  return jsonb_build_object('ok',false,'error',SQLERRM,'state',SQLSTATE);
end;$$;`;

async function bootstrapExecSql() {
  // Test if exec_sql already exists
  const test = await post('/rest/v1/rpc/exec_sql', { sql: 'select 1' });
  if (test.status === 200) return true;

  // Not found — try creating it via the extension schema
  console.log('  exec_sql not found, bootstrapping...');

  // Use PostgREST schema=extensions header which some versions allow
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`${URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        ...HEADS,
        'Accept-Profile': 'extensions',
        'Content-Profile': 'extensions',
      },
      body: JSON.stringify({ sql: EXEC_SQL_DEF }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    const body = await r.text();
    console.log(`  bootstrap attempt: ${r.status} ${body.slice(0, 80)}`);
  } catch (e) {
    clearTimeout(t);
    console.log(`  bootstrap failed: ${e.message}`);
  }

  // Final check
  const check = await post('/rest/v1/rpc/exec_sql', { sql: 'select 1' });
  return check.status === 200;
}

// ── Statement splitter (dollar-quote aware) ───────────────────
function splitStatements(sql) {
  const out = [];
  let cur = '';
  let dTag = null;

  for (const line of sql.split('\n')) {
    // Track $$ blocks
    const tags = [...line.matchAll(/\$([^$]*)\$/g)].map((m) => m[0]);
    for (const tag of tags) {
      if (dTag === null) dTag = tag;
      else if (tag === dTag) dTag = null;
    }
    cur += line + '\n';
    if (dTag === null && line.trimEnd().endsWith(';')) {
      const stmt = cur.trim();
      // Skip pure-comment blocks
      if (stmt && stmt.replace(/--[^\n]*/g, '').replace(/\s/g, '').length > 0) {
        out.push(stmt);
      }
      cur = '';
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter((s) => s.replace(/--[^\n]*/g, '').replace(/\s/g, '').length > 0);
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 HandyNG Migration Applicator\n');
  console.log(`   Project: ${URL}`);

  // 1. Wake project
  const awake = await wakeProject();
  if (!awake) {
    console.error('\n❌ Project is unresponsive.');
    console.error('   Visit your Supabase Dashboard and restore the project:');
    console.error('   https://supabase.com/dashboard/project/cuozjelmnukyehrrlxpo\n');
    process.exit(1);
  }

  // 2. Bootstrap
  const ready = await bootstrapExecSql();
  if (!ready) {
    console.error('\n❌ Could not create exec_sql helper.');
    console.error('   Run this SQL once in the Supabase Dashboard SQL editor:');
    console.error('   https://supabase.com/dashboard/project/cuozjelmnukyehrrlxpo/sql/new\n');
    console.error(EXEC_SQL_DEF);
    console.error('\n   Then re-run: node supabase/apply-http.mjs\n');
    process.exit(1);
  }
  console.log('  exec_sql ready ✓\n');

  // 3. Apply bundle
  const bundle = readFileSync(resolve(__dirname, 'dist/full_migration.sql'), 'utf-8');
  const stmts = splitStatements(bundle);
  console.log(`📦 Applying ${stmts.length} statements...\n`);

  let ok = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < stmts.length; i++) {
    const stmt = stmts[i];
    const label = stmt
      .replace(/--[^\n]*/g, '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 72);

    try {
      const r = await post('/rest/v1/rpc/exec_sql', { sql: stmt });
      if (r.status === 200 && r.body?.ok !== false) {
        ok++;
      } else {
        const err = r.body?.error || r.body?.message || JSON.stringify(r.body).slice(0, 120);
        if (/already exist|duplicate/i.test(err)) {
          skipped++;
        } else {
          failed++;
          console.error(`  ✗ [${i + 1}/${stmts.length}] ${label}`);
          console.error(`    → ${err}\n`);
        }
      }
    } catch (e) {
      failed++;
      console.error(`  ✗ [${i + 1}/${stmts.length}] ${label}`);
      console.error(`    → ${e.message}\n`);
    }
  }

  console.log(`\n${'─'.repeat(56)}`);
  console.log(`✅ ${ok} applied   ⏭  ${skipped} skipped   ❌ ${failed} failed`);
  console.log(`${'─'.repeat(56)}\n`);

  if (failed > 0) {
    console.log('Some statements failed. The schema may be partially applied.');
    console.log('Re-running is safe — the seed uses ON CONFLICT DO UPDATE.\n');
    process.exit(1);
  } else {
    console.log('Database schema and seed data are ready! ✓\n');
  }
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
