import { api } from '@/lib/api';
import { ServiceCategory } from '@/types/database';

/**
 * Fetch all active service categories from the HandyNG API.
 * Called server-side in Server Components so the result is cached by Next.js.
 */
export async function fetchCategories(): Promise<ServiceCategory[]> {
  const res = await api.get<ServiceCategory[]>('/api/v1/categories');
  return res.data;
}

/**
 * Fetch a single category by slug.
 */
export async function fetchCategoryBySlug(slug: string): Promise<ServiceCategory> {
  const res = await api.get<ServiceCategory>(`/api/v1/categories/${slug}`);
  return res.data;
}
