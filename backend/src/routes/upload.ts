import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { avatarUpload } from '../middleware/upload';
import { uploadAvatarHandler } from '../controllers/upload.controller';

const router = Router();

/**
 * POST /api/v1/upload/avatar
 * Upload a profile picture. Requires authentication.
 * Field name: "avatar" (image/jpeg | image/png | image/webp, max 2 MB)
 */
router.post('/avatar', requireAuth, avatarUpload.single('avatar'), uploadAvatarHandler);

export default router;
