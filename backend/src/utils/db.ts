/**
 * Database utility helpers.
 */

import { supabaseAdmin } from '../config/supabase';

/**
 * Quick connectivity check — queries a single row from service_categories.
 * Returns true if the DB is reachable, false otherwise.
 */
export async function checkDbConnection(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const { error } = await supabaseAdmin.from('service_categories').select('id').limit(1).single();

    // PGRST116 = "no rows" which is fine — the table exists
    if (error && error.code !== 'PGRST116') {
      return { ok: false, latencyMs: Date.now() - start };
    }
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
