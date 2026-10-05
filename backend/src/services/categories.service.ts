import { supabaseAdmin } from '../config/supabase';
import { ServiceCategory } from '../types/database';
import { ApiError } from '../middleware/errorHandler';

export interface CategoriesFilter {
  activeOnly?: boolean;
}

/**
 * Fetch all service categories.
 * Public endpoint — no auth required.
 */
export async function getAllCategories(filter: CategoriesFilter = {}): Promise<ServiceCategory[]> {
  let query = supabaseAdmin
    .from('service_categories')
    .select('*')
    .order('name', { ascending: true });

  if (filter.activeOnly !== false) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to fetch categories: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Fetch a single category by slug.
 */
export async function getCategoryBySlug(slug: string): Promise<ServiceCategory> {
  const { data, error } = await supabaseAdmin
    .from('service_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new ApiError(404, 'NOT_FOUND', `Category "${slug}" not found`);
  }

  return data;
}

/**
 * Create a new category — admin only.
 */
export async function createCategory(
  payload: Pick<ServiceCategory, 'name' | 'slug' | 'description' | 'icon'>
): Promise<ServiceCategory> {
  const { data, error } = await supabaseAdmin
    .from('service_categories')
    .insert({ ...payload, is_active: true })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ApiError(409, 'CONFLICT', 'A category with that name or slug already exists');
    }
    throw new ApiError(500, 'DB_ERROR', `Failed to create category: ${error.message}`);
  }

  return data;
}

/**
 * Update a category — admin only.
 */
export async function updateCategory(
  id: string,
  payload: Partial<Pick<ServiceCategory, 'name' | 'slug' | 'description' | 'icon' | 'is_active'>>
): Promise<ServiceCategory> {
  const { data, error } = await supabaseAdmin
    .from('service_categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new ApiError(404, 'NOT_FOUND', 'Category not found');
  }

  return data;
}

/**
 * Delete (deactivate) a category — admin only.
 * We soft-delete by setting is_active = false so existing service links are preserved.
 */
export async function deactivateCategory(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('service_categories')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to deactivate category: ${error.message}`);
  }
}
