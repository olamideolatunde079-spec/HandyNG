/**
 * Applies migration 005 (security hardening) statement by statement
 * via the Supabase REST API using exec_sql if available,
 * otherwise reports what needs to be run manually.
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const dotenv = require('/home/olamide/Desktop/HandyNG/node_modules/dotenv');
dotenv.config({ path: resolve(__dirname, '../.env') });

const URL   = process.env.SUPABASE_URL;
const KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;

const HEADS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${KEY}`,
  'apikey': KEY,
};

async function tryExecSql(sql) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(`${URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST', headers: HEADS,
      body: JSON.stringify({ sql }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    const body = await r.json().catch(() => ({}));
    return { ok: r.status === 200, status: r.status, body };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, status: 0, body: { error: e.message } };
  }
}

function splitStatements(sql) {
  const out = [];
  let cur = '';
  let dTag = null;
  for (const line of sql.split('\n')) {
    const tags = [...line.matchAll(/\$([^$]*)\$/g)].map(m => m[0]);
    for (const tag of tags) {
      dTag = dTag === null ? tag : (tag === dTag ? null : dTag);
    }
    cur += line + '\n';
    if (dTag === null && line.trimEnd().endsWith(';')) {
      const stmt = cur.trim();
      if (stmt.replace(/--[^\n]*/g, '').replace(/\s/g, '').length > 0) {
        out.push(stmt);
      }
      cur = '';
    }
  }
  return out;
}

async function main() {
  console.log('\n🔒 Applying migration 005: Security hardening\n');

  const sql = readFileSync(resolve(__dirname, 'migrations/005_security_hardening.sql'), 'utf-8');
  const stmts = splitStatements(sql);

  // Test if exec_sql is available
  const test = await tryExecSql('select 1');
  if (test.status !== 200) {
    console.log('⚠️  exec_sql not available via REST API.');
    console.log('\n📋 Run this SQL in the Supabase Dashboard SQL editor:');
    console.log('   https://supabase.com/dashboard/project/cuozjelmnukyehrrlxpo/sql/new\n');
    console.log('File: supabase/migrations/005_security_hardening.sql\n');
    console.log('This fixes:');
    console.log('  ✓ function_search_path_mutable on 6 functions');
    console.log('  ✓ anon_security_definer_function_executable on 5 functions\n');
    return;
  }

  let ok = 0, failed = 0;
  for (const stmt of stmts) {
    const label = stmt.replace(/--[^\n]*/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
    const r = await tryExecSql(stmt);
    if (r.ok) {
      ok++;
      console.log(`  ✓ ${label}`);
    } else {
      failed++;
      console.error(`  ✗ ${label}`);
      console.error(`    ${r.body?.error || r.body?.message || JSON.stringify(r.body).slice(0, 100)}`);
    }
  }

  console.log(`\n${failed === 0 ? '✅' : '⚠️'} ${ok} applied, ${failed} failed`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
