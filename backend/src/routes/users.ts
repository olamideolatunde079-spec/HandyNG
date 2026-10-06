import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getMyUser, updateMyUser } from '../controllers/users.controller';

const router = Router();

/**
 * All /users/me routes require authentication.
 */
router.get('/me', requireAuth, getMyUser);
router.patch('/me', requireAuth, updateMyUser);

export default router;
