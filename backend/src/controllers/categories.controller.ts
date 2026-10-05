import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated } from '../types/api';
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deactivateCategory,
} from '../services/categories.service';

/**
 * GET /api/v1/categories
 * Returns all active service categories.
 * Public — no authentication required.
 */
export async function listCategories(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await getAllCategories({ activeOnly: true });
    sendSuccess(res, categories, `${categories.length} categories found`);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/categories/:slug
 * Returns a single active category by slug.
 * Public — no authentication required.
 */
export async function getCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const category = await getCategoryBySlug(slug);
    sendSuccess(res, category);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/categories
 * Creates a new service category.
 * Admin only — enforced by requireAdmin middleware on the router.
 */
export async function addCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, slug, description, icon } = req.body as {
      name: string;
      slug: string;
      description?: string;
      icon?: string;
    };
    const category = await createCategory({
      name,
      slug,
      description: description ?? null,
      icon: icon ?? null,
    });
    sendCreated(res, category, 'Category created');
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/categories/:id
 * Updates a category.
 * Admin only.
 */
export async function editCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const category = await updateCategory(id, req.body);
    sendSuccess(res, category, 'Category updated');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/categories/:id
 * Soft-deletes (deactivates) a category.
 * Admin only.
 */
export async function removeCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await deactivateCategory(id);
    sendSuccess(res, null, 'Category deactivated');
  } catch (err) {
    next(err);
  }
}
