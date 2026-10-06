import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/**
 * Returns the Supabase browser client (anon key only).
 * Lazily initialised — never throws at module evaluation time, so it is safe
 * to import in any file including those used during Next.js static generation.
 *
 * Only call this inside 'use client' components or client-side hooks.
 */
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '';
  const key = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '';

  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return _client;
}

/**
 * Direct default export for convenience.
 * Alias of getSupabaseClient() — use in 'use client' components only.
 */
export default getSupabaseClient;
