/**
 * Augment Express Request with our authenticated user shape.
 * This file must be a module (has an import/export) so TypeScript
 * treats it as a module augmentation, not a global script.
 */

import { UserRole } from './database';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
