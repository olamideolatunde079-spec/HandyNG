import { Router } from 'express';
import { requireAuth, requireArtisan } from '../middleware/requireAuth';
import {
  getMe,
  getArtisan,
  updateMe,
  listMyAreas,
  addArea,
  removeArea,
} from '../controllers/artisans.controller';
import { validate, updateArtisanProfileSchema } from '../validators/profile.validator';
import { validate as validateArea } from '../validators/profile.validator';
import { serviceAreaSchema } from '../validators/artisan.validator';

const router = Router();

// ── Public ──────────────────────────────────────────────────────
// NOTE: /me routes must come before /:id to avoid matching "me" as an id
router.get('/me', requireAuth, requireArtisan, getMe);
router.patch('/me', requireAuth, requireArtisan, validate(updateArtisanProfileSchema), updateMe);

// ── Service areas (artisan only) ────────────────────────────────
router.get('/me/areas', requireAuth, requireArtisan, listMyAreas);
router.post('/me/areas', requireAuth, requireArtisan, validateArea(serviceAreaSchema), addArea);
router.delete('/me/areas/:areaId', requireAuth, requireArtisan, removeArea);

// ── Public artisan profile by id ────────────────────────────────
router.get('/:id', getArtisan);

export default router;
