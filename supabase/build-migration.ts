/**
 * Migration bundler — concatenates all SQL files into a single file
 * for use with the Supabase Dashboard SQL editor.
 *
 * Usage:
 *   npx ts-node supabase/build-migration.ts
 *
 * Output: supabase/dist/full_migration.sql
 */

import fs from 'fs';
import path from 'path';

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'dist');
const OUT_FILE = path.join(OUT_DIR, 'full_migration.sql');

function getSortedSqlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => path.join(dir, f));
}

function main(): void {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const banner = `-- ============================================================
-- HandyNG Full Migration Bundle
-- Generated: ${new Date().toISOString()}
-- Apply this file in the Supabase Dashboard SQL editor.
-- Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================\n\n`;

  let output = banner;

  const migrationFiles = getSortedSqlFiles(path.join(ROOT, 'migrations'));
  const seedFiles = getSortedSqlFiles(path.join(ROOT, 'seed'));
  const allFiles = [...migrationFiles, ...seedFiles];

  for (const file of allFiles) {
    const fileName = path.basename(file);
    const sql = fs.readFileSync(file, 'utf-8');
    output += `-- ── ${fileName} ${'─'.repeat(Math.max(0, 56 - fileName.length))}\n\n`;
    output += sql.trim();
    output += '\n\n';
  }

  fs.writeFileSync(OUT_FILE, output, 'utf-8');
  console.log(`\n✅ Migration bundle written to:\n   ${OUT_FILE}\n`);
  console.log('Next steps:');
  console.log('  1. Open the Supabase Dashboard: https://app.supabase.com');
  console.log('  2. Select your project: cuozjelmnukyehrrlxpo');
  console.log('  3. Go to SQL Editor → New Query');
  console.log('  4. Paste the contents of supabase/dist/full_migration.sql');
  console.log('  5. Click Run\n');
  console.log(
    'Alternatively, add DATABASE_URL to .env and run: npm run migrate --workspace=supabase\n'
  );
}

main();
