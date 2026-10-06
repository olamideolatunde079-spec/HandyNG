import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from './auth';
import { ApiError } from './errorHandler';
import { UserRole } from '../types/database';

/**
 * requireAuth
 *
 * Verifies the JWT and attaches req.user.
 * Use on any route that needs an authenticated user.
 *
 * @example
 *   router.get('/me', requireAuth, getMe);
 */
export const requireAuth = verifyJwt;

/**
 * requireRole(...roles)
 *
 * Factory that returns a middleware enforcing role-based access.
 * Must be used AFTER requireAuth so req.user is populated.
 *
 * @example
 *   router.post('/', requireAuth, requireRole('admin'), createCategory);
 */
export function requireRole(...roles: UserRole[]) {
  return function (req: Request, _res: Response, next: NextFunction): void {
    if (!req.user) {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, 'FORBIDDEN', `Access denied. Required role: ${roles.join(' or ')}`)
      );
    }

    next();
  };
}

/**
 * requireAdmin — shorthand for requireRole('admin')
 */
export const requireAdmin = requireRole('admin');

/**
 * requireArtisan — shorthand for requireRole('artisan')
 */
export const requireArtisan = requireRole('artisan');

/**
 * requireCustomer — shorthand for requireRole('customer')
 */
export const requireCustomer = requireRole('customer');
