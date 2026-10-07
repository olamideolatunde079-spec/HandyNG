import { supabaseAdmin } from '../config/supabase';
import { Service } from '../types/database';
import { ApiError } from '../middleware/errorHandler';
import { CreateServiceInput, UpdateServiceInput } from '../validators/service.validator';

// ── Helpers ────────────────────────────────────────────────────

async function getArtisanId(userId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('artisan_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new ApiError(
      404,
      'ARTISAN_PROFILE_NOT_FOUND',
      'Artisan profile not found. Ensure your account role is "artisan".'
    );
  }
  return data.id;
}

// ── Public queries ─────────────────────────────────────────────

/**
 * List services for a given artisan (public).
 */
export async function getServicesByArtisan(artisanId: string): Promise<Service[]> {
  const { data, error } = await supabaseAdmin
    .from('services')
    .select('*, service_categories(name, slug, icon)')
    .eq('artisan_id', artisanId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to fetch services: ${error.message}`);
  }
  return data ?? [];
}

/**
 * List services in a category (for /services/[slug] page).
 * Returns services with artisan profile info.
 */
export async function getServicesByCategory(categorySlug: string): Promise<Service[]> {
  // Resolve category id from slug
  const { data: cat, error: catErr } = await supabaseAdmin
    .from('service_categories')
    .select('id')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single();

  if (catErr || !cat) {
    throw new ApiError(404, 'NOT_FOUND', `Category "${categorySlug}" not found`);
  }

  const { data, error } = await supabaseAdmin
    .from('services')
    .select(
      '*, artisan_profiles(id, business_name, average_rating, total_reviews, verification_status, service_radius)'
    )
    .eq('category_id', cat.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to fetch services: ${error.message}`);
  }
  return data ?? [];
}

// ── Artisan-owned CRUD ─────────────────────────────────────────

/**
 * List all services owned by the authenticated artisan (includes inactive).
 */
export async function getMyServices(userId: string): Promise<Service[]> {
  const artisanId = await getArtisanId(userId);

  const { data, error } = await supabaseAdmin
    .from('services')
    .select('*, service_categories(id, name, slug, icon)')
    .eq('artisan_id', artisanId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to fetch services: ${error.message}`);
  }
  return data ?? [];
}

/**
 * Create a new service for the authenticated artisan.
 */
export async function createMyService(userId: string, input: CreateServiceInput): Promise<Service> {
  const artisanId = await getArtisanId(userId);

  // Validate price range
  if (input.price_from != null && input.price_to != null && input.price_to < input.price_from) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'price_to must be greater than or equal to price_from'
    );
  }

  const { data, error } = await supabaseAdmin
    .from('services')
    .insert({ ...input, artisan_id: artisanId })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to create service: ${error.message}`);
  }
  return data;
}

/**
 * Update a service — only if the authenticated artisan owns it.
 */
export async function updateMyService(
  userId: string,
  serviceId: string,
  input: Partial<UpdateServiceInput>
): Promise<Service> {
  const artisanId = await getArtisanId(userId);

  // Confirm ownership
  const { data: existing } = await supabaseAdmin
    .from('services')
    .select('id, price_from, price_to')
    .eq('id', serviceId)
    .eq('artisan_id', artisanId)
    .single();

  if (!existing) {
    throw new ApiError(404, 'NOT_FOUND', 'Service not found or you do not own it');
  }

  // Validate price range using merged values
  const mergedFrom = input.price_from ?? existing.price_from;
  const mergedTo = input.price_to ?? existing.price_to;
  if (mergedFrom != null && mergedTo != null && mergedTo < mergedFrom) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'price_to must be greater than or equal to price_from'
    );
  }

  const { data, error } = await supabaseAdmin
    .from('services')
    .update(input)
    .eq('id', serviceId)
    .eq('artisan_id', artisanId)
    .select()
    .single();

  if (error || !data) {
    throw new ApiError(500, 'DB_ERROR', `Failed to update service: ${error?.message}`);
  }
  return data;
}

/**
 * Delete (deactivate) a service — soft delete to preserve history.
 */
export async function deleteMyService(userId: string, serviceId: string): Promise<void> {
  const artisanId = await getArtisanId(userId);

  const { error } = await supabaseAdmin
    .from('services')
    .update({ is_active: false })
    .eq('id', serviceId)
    .eq('artisan_id', artisanId);

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to delete service: ${error.message}`);
  }
}
