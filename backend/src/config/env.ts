import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from the backend directory first, then fall back to workspace root.
// This means `backend/.env` takes priority over the root `.env`.
const backendEnvPath = path.resolve(__dirname, '../../.env');
const rootEnvPath = path.resolve(__dirname, '../../../.env');

dotenv.config({ path: backendEnvPath });
dotenv.config({ path: rootEnvPath, override: false }); // don't override already-set values

/**
 * Validated environment configuration.
 * All values are read once at startup — missing required variables
 * throw immediately so there are no silent runtime failures.
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
    origins: optional('CORS_ORIGINS', 'http://localhost:3000').split(','),
  },
} as const;
