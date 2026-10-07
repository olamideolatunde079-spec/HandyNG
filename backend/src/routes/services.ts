import { Router } from 'express';
import { requireAuth, requireArtisan } from '../middleware/requireAuth';
import {
  listServices,
  listMyServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/services.controller';
import { validate } from '../validators/profile.validator';
import { createServiceSchema, updateServiceSchema } from '../validators/service.validator';

const router = Router();

// ── Public ─────────────────────────────────────────────────────
// GET /api/v1/services?artisan_id=xxx  OR  ?category_slug=xxx
router.get('/', listServices);

// ── Artisan-owned ──────────────────────────────────────────────
// Must come before /:id to avoid "me" being treated as an id
router.get('/me', requireAuth, requireArtisan, listMyServices);

router.post('/', requireAuth, requireArtisan, validate(createServiceSchema), createService);
router.patch('/:id', requireAuth, requireArtisan, validate(updateServiceSchema), updateService);
router.delete('/:id', requireAuth, requireArtisan, deleteService);

export default router;
