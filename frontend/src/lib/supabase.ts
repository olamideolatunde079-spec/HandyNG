import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
  );
}

/**
 * Frontend Supabase client — uses the anon/publishable key.
 *
 * This client is safe to use in browser code. All database access
 * is governed by Row Level Security policies. Never use the
 * service-role key here.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
