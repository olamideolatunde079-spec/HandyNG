import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/**
 * Returns the Supabase browser client (anon/publishable key only).
 *
 * Lazily created so it never executes at module-evaluation time —
 * safe to import in Server Components and SSG pages.
 *
 * At runtime this MUST be called from a 'use client' component only.
 * If the env vars are missing the error message tells you exactly what to do.
 */
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const key = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not set.\n' +
        'Make sure frontend/.env.local exists and contains:\n' +
        '  NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co'
    );
  }
  if (!key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.\n' +
        'Make sure frontend/.env.local exists and contains:\n' +
        '  NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...'
    );
  }

  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return _client;
}
