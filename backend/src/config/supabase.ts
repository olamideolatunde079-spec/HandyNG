import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Backend Supabase client — uses the service-role key.
 *
 * This client bypasses Row Level Security and has full database access.
 * It must NEVER be exposed to the frontend or included in client bundles.
 * Use only in server-side code (controllers, services, middleware).
 */
export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: {
    // Disable automatic session persistence on the server
    persistSession: false,
    autoRefreshToken: false,
  },
});
