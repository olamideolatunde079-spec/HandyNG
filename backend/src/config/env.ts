import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from the workspace root (two levels up from backend/src/config/)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Validated environment configuration.
 * All values are read once at startup so missing variables
 * cause an early, clear error rather than a silent runtime failure.
 */

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '3001'), 10),
  isDev: optional('NODE_ENV', 'development') === 'development',
  isProd: optional('NODE_ENV', 'development') === 'production',

  supabase: {
    url: required('SUPABASE_URL'),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
    jwksUrl: required('SUPABASE_JWKS_URL'),
  },

  cors: {
    // Comma-separated list of allowed origins, e.g. http://localhost:3000
    origins: optional('CORS_ORIGINS', 'http://localhost:3000').split(','),
  },
} as const;
