import { Router } from 'express';
import {
  listCategories,
  getCategory,
  addCategory,
  editCategory,
  removeCategory,
} from '../controllers/categories.controller';
import { requireAuth, requireAdmin } from '../middleware/requireAuth';

const router = Router();

// ── Public ─────────────────────────────────────────────────────
router.get('/', listCategories);
router.get('/:slug', getCategory);

// ── Admin only ─────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, addCategory);
router.patch('/:id', requireAuth, requireAdmin, editCategory);
router.delete('/:id', requireAuth, requireAdmin, removeCategory);

export default router;
