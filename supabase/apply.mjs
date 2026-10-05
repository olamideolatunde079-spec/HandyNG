/**
 * HandyNG — direct SQL applicator
 * Uses the Supabase HTTP API with the service-role key.
 * Splits the migration bundle into individual statements
 * and applies them one by one via node-postgres over SSL.
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load dotenv manually
const dotenv = require('/home/olamide/Desktop/HandyNG/node_modules/dotenv');
dotenv.config({ path: resolve(__dirname, '../.env') });

const pg = require('/home/olamide/Desktop/HandyNG/node_modules/pg');
const { Client } = pg;

// ── Connection candidates (try each in order) ───────────────
const PROJECT_REF = 'cuozjelmnukyehrrlxpo';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DB_URL = process.env.DATABASE_URL;

const candidates = [
  // 1. Explicit DATABASE_URL from .env
  DB_URL && { label: 'DATABASE_URL from .env', connectionString: DB_URL },
  // 2. Supabase direct host — postgres user, service key as password
  {
    label: 'db.supabase.co direct (postgres)',
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: SERVICE_KEY,
    ssl: { rejectUnauthorized: false },
  },
  // 3–8. Pooler session mode across all Supabase AWS regions
  ...['us-east-1', 'us-west-1', 'eu-west-1', 'eu-west-2', 'ap-southeast-1', 'ap-northeast-1'].map(
    (region) => ({
      label: `pooler ${region}:5432`,
      host: `aws-0-${region}.pooler.supabase.com`,
      port: 5432,
      database: 'postgres',
      user: `postgres.${PROJECT_REF}`,
      password: SERVICE_KEY,
      ssl: { rejectUnauthorized: false },
    })
  ),
].filter(Boolean);

async function tryConnect(config) {
  const client = new Client({ ...config, connectionTimeoutMillis: 8000 });
  await client.connect();
  return client;
}

/** Split SQL into individual statements, skipping blank lines and pure comments */
function splitStatements(sql) {
  // Split on semicolons that are NOT inside single-quoted strings or dollar-quote blocks
  // Simple approach: split on ";\n" boundaries then reassemble dollar-quoted blocks
  const statements = [];
  let current = '';
  let dollarTag = null;

  for (const line of sql.split('\n')) {
    // Track dollar-quoting (e.g. $$ ... $$)
    const dollarMatches = line.match(/\$([^$]*)\$/g) || [];
    for (const tag of dollarMatches) {
      if (dollarTag === null) {
        dollarTag = tag;
      } else if (tag === dollarTag) {
        dollarTag = null;
      }
    }

    current += line + '\n';

    // Only split on semicolons outside dollar-quoted blocks
    if (dollarTag === null && line.trimEnd().endsWith(';')) {
      const stmt = current.trim();
      if (stmt && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      current = '';
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements.filter((s) => s.length > 0 && !s.match(/^--/));
}

async function main() {
  // ── Find a working connection ──────────────────────────────
  let client = null;
  for (const cfg of candidates) {
    try {
      process.stdout.write(`Trying ${cfg.label}... `);
      client = await tryConnect(cfg);
      console.log('✓ connected');
      break;
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }

  if (!client) {
    console.error('\n❌ Could not connect to the database.');
    console.error('Add DATABASE_URL to .env — get it from:');
    console.error('  Supabase Dashboard → Project Settings → Database → URI\n');
    process.exit(1);
  }

  // ── Read migration bundle ──────────────────────────────────
  const bundlePath = resolve(__dirname, 'dist/full_migration.sql');
  const sql = readFileSync(bundlePath, 'utf-8');
  const statements = splitStatements(sql);

  console.log(`\n📦 Applying ${statements.length} statements...\n`);

  let ok = 0;
  let skip = 0;

  for (const stmt of statements) {
    // Show a short label (first non-comment line, truncated)
    const label =
      stmt
        .split('\n')
        .find((l) => !l.startsWith('--'))
        ?.slice(0, 72) ?? '(empty)';
    try {
      await client.query(stmt);
      ok++;
      if (process.env.VERBOSE) console.log(`  ✓ ${label}`);
    } catch (e) {
      // "already exists" errors are safe to skip (idempotent re-run)
      if (
        e.message.match(/already exists|duplicate key|does not exist/i) &&
        e.message.match(/already exists|duplicate/i)
      ) {
        skip++;
        if (process.env.VERBOSE) console.log(`  ~ (skipped) ${label}`);
      } else {
        console.error(`\n  ✗ FAILED: ${label}`);
        console.error(`    ${e.message}\n`);
        // Continue to next statement instead of aborting
        skip++;
      }
    }
  }

  await client.end();
  console.log(`\n✅ Done — ${ok} applied, ${skip} skipped/errored`);
  console.log('Run the backend health check to verify DB connectivity.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
