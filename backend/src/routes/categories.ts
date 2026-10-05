import { Router } from 'express';
import {
  listCategories,
  getCategory,
  addCategory,
  editCategory,
  removeCategory,
} from '../controllers/categories.controller';

const router = Router();

/**
 * Public routes — no auth required
 */
router.get('/', listCategories);
router.get('/:slug', getCategory);

/**
 * Admin-only routes.
 * Auth middleware (requireAuth + requireAdmin) will be added in Phase 3.
 * For now the routes exist but are unprotected — we will guard them in the
 * authentication phase. Do not expose these in production until then.
 */
router.post('/', addCategory);
router.patch('/:id', editCategory);
router.delete('/:id', removeCategory);

export default router;
