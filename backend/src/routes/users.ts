import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getMyUser, updateMyUser } from '../controllers/users.controller';
import { validate, updateProfileSchema } from '../validators/profile.validator';

const router = Router();

router.get('/me', requireAuth, getMyUser);
router.patch('/me', requireAuth, validate(updateProfileSchema), updateMyUser);

export default router;
