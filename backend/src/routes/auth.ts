import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getMe } from '../controllers/auth.controller';

const router = Router();

/**
 * GET /api/v1/auth/me
 * Returns JWT identity + profile for the authenticated user.
 * Requires: Bearer token in Authorization header.
 */
router.get('/me', requireAuth, getMe);

export default router;
