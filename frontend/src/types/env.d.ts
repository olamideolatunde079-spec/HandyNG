/**
 * Augment the global NodeJS.ProcessEnv interface so TypeScript
 * knows the shape of every NEXT_PUBLIC_ variable used in the frontend.
 *
 * Values are always string | undefined at runtime — use ?? to provide fallbacks.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    /** Supabase project URL — safe to expose in the browser */
    NEXT_PUBLIC_SUPABASE_URL?: string;
    /** Supabase anon/publishable key — safe to expose in the browser */
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    /** HandyNG Express API base URL, e.g. http://localhost:3001 */
    NEXT_PUBLIC_API_URL?: string;
  }
}
