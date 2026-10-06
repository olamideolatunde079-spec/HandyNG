import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { env } from '../config/env';
import { ApiError } from './errorHandler';
import { UserRole } from '../types/database';
import { AuthUser } from '../types/express';

// Re-export so other modules can import AuthUser from here if needed
export type { AuthUser };

// ── JWKS remote key set (cached after first fetch) ─────────────
const JWKS = createRemoteJWKSet(new URL(env.supabase.jwksUrl));

// ── JWT payload shape from Supabase v2 ────────────────────────
interface SupabaseJwtPayload extends JWTPayload {
  sub: string;
  email?: string;
  role?: string;
  app_metadata?: {
    role?: UserRole;
    provider?: string;
  };
  user_metadata?: {
    role?: UserRole;
  };
}

/**
 * Extract and verify the Bearer JWT from the Authorization header.
 * Attaches req.user if valid. Throws ApiError(401) otherwise.
 */
export async function verifyJwt(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header'));
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify<SupabaseJwtPayload>(token, JWKS, {
      issuer: `${env.supabase.url}/auth/v1`,
      audience: 'authenticated',
    });

    const role: UserRole = payload.app_metadata?.role ?? payload.user_metadata?.role ?? 'customer';

    req.user = {
      id: payload.sub,
      email: payload.email ?? '',
      role,
    };

    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token verification failed';
    next(new ApiError(401, 'INVALID_TOKEN', `Invalid or expired token: ${message}`));
  }
}
