import { Router } from 'express';
import { requireAuth, requireArtisan } from '../middleware/requireAuth';
import {
  listArtisansHandler,
  getArtisan,
  getMe,
  updateMe,
  listMyAreas,
  addArea,
  removeArea,
} from '../controllers/artisans.controller';
import { validate, updateArtisanProfileSchema } from '../validators/profile.validator';
import { validate as validateArea } from '../validators/profile.validator';
import { serviceAreaSchema } from '../validators/artisan.validator';

const router = Router();

// ── Public listing ──────────────────────────────────────────────
router.get('/', listArtisansHandler);

// ── Authenticated artisan (self) — /me MUST come before /:id ───
router.get('/me', requireAuth, requireArtisan, getMe);
router.patch('/me', requireAuth, requireArtisan, validate(updateArtisanProfileSchema), updateMe);

// ── Service areas ───────────────────────────────────────────────
router.get('/me/areas', requireAuth, requireArtisan, listMyAreas);
router.post('/me/areas', requireAuth, requireArtisan, validateArea(serviceAreaSchema), addArea);
router.delete('/me/areas/:areaId', requireAuth, requireArtisan, removeArea);

// ── Public artisan profile by id ────────────────────────────────
router.get('/:id', getArtisan);

export default router;
