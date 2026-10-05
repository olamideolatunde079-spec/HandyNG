/**
 * HandyNG Migration Runner
 *
 * Applies all SQL files in supabase/migrations/ and supabase/seed/
 * to the remote Supabase PostgreSQL database in order.
 *
 * Usage:
 *   npx ts-node supabase/migrate.ts           # run migrations only
 *   npx ts-node supabase/migrate.ts --seed    # run migrations + seed
 *
 * Requires: DATABASE_URL or SUPABASE_DB_URL in .env
 * Connection string format:
 *   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
 */

import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';
import fs from 'fs';

// Load from workspace root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_URL = process.env['DATABASE_URL'] ?? process.env['SUPABASE_DB_URL'];
const RUN_SEED = process.argv.includes('--seed');

if (!DB_URL) {
  console.error(
    '\n❌ No database URL found.\n' +
      'Add DATABASE_URL to your .env file:\n' +
      '  DATABASE_URL=postgresql://postgres:[PASSWORD]@db.cuozjelmnukyehrrlxpo.supabase.co:5432/postgres\n\n' +
      'You can find the connection string in:\n' +
      '  Supabase Dashboard → Project Settings → Database → Connection string\n'
  );
  process.exit(1);
}

async function runSqlFile(client: Client, filePath: string): Promise<void> {
  const fileName = path.basename(filePath);
  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log(`  ▶ Applying ${fileName}...`);
  try {
    await client.query(sql);
    console.log(`  ✓ ${fileName}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${fileName}: ${message}`);
    throw err;
  }
}

function getSortedSqlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => path.join(dir, f));
}

async function main(): Promise<void> {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    console.log('\n🔌 Connecting to database...');
    await client.connect();
    console.log('✓ Connected\n');

    // Run migrations
    const migrationsDir = path.resolve(__dirname, 'migrations');
    const migrationFiles = getSortedSqlFiles(migrationsDir);

    if (migrationFiles.length === 0) {
      console.log('⚠️  No migration files found in supabase/migrations/');
    } else {
      console.log(`📦 Applying ${migrationFiles.length} migration(s)...`);
      for (const file of migrationFiles) {
        await runSqlFile(client, file);
      }
      console.log('\n✅ Migrations complete\n');
    }

    // Run seed if requested
    if (RUN_SEED) {
      const seedDir = path.resolve(__dirname, 'seed');
      const seedFiles = getSortedSqlFiles(seedDir);

      if (seedFiles.length === 0) {
        console.log('⚠️  No seed files found in supabase/seed/');
      } else {
        console.log(`🌱 Applying ${seedFiles.length} seed file(s)...`);
        for (const file of seedFiles) {
          await runSqlFile(client, file);
        }
        console.log('\n✅ Seed complete\n');
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Migration failed: ${message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
