import { supabaseAdmin } from '../config/supabase';
import { ArtisanProfile, ServiceArea } from '../types/database';
import { ApiError } from '../middleware/errorHandler';
import { UpdateArtisanProfileInput } from '../validators/profile.validator';

// ── Artisan profile ────────────────────────────────────────────

/**
 * Fetch the artisan_profile row for the authenticated artisan.
 * Returns the row linked to the given auth user_id.
 */
export async function getMyArtisanProfile(userId: string): Promise<ArtisanProfile> {
  const { data, error } = await supabaseAdmin
    .from('artisan_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new ApiError(
      404,
      'ARTISAN_PROFILE_NOT_FOUND',
      'Artisan profile not found. Make sure your account role is "artisan".'
    );
  }
  return data;
}

/**
 * Fetch any artisan profile by its primary key (public).
 */
export async function getArtisanProfileById(id: string): Promise<ArtisanProfile> {
  const { data, error } = await supabaseAdmin
    .from('artisan_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new ApiError(404, 'NOT_FOUND', 'Artisan not found');
  }
  return data;
}

/**
 * Update the artisan's own profile.
 */
export async function updateMyArtisanProfile(
  userId: string,
  payload: Partial<UpdateArtisanProfileInput>
): Promise<ArtisanProfile> {
  const { data, error } = await supabaseAdmin
    .from('artisan_profiles')
    .update(payload)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    throw new ApiError(500, 'DB_ERROR', `Failed to update artisan profile: ${error?.message}`);
  }
  return data;
}

// ── Service areas ──────────────────────────────────────────────

export interface ServiceAreaInput {
  city: string;
  state: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}

/**
 * List all service areas for the authenticated artisan.
 */
export async function getMyServiceAreas(userId: string): Promise<ServiceArea[]> {
  // First resolve artisan_profile.id from user_id
  const { data: ap, error: apErr } = await supabaseAdmin
    .from('artisan_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (apErr || !ap) {
    throw new ApiError(404, 'ARTISAN_PROFILE_NOT_FOUND', 'Artisan profile not found');
  }

  const { data, error } = await supabaseAdmin
    .from('service_areas')
    .select('*')
    .eq('artisan_id', ap.id)
    .order('state', { ascending: true });

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to fetch service areas: ${error.message}`);
  }
  return data ?? [];
}

/**
 * Add a service area for the authenticated artisan.
 */
export async function addServiceArea(
  userId: string,
  payload: ServiceAreaInput
): Promise<ServiceArea> {
  const { data: ap, error: apErr } = await supabaseAdmin
    .from('artisan_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (apErr || !ap) {
    throw new ApiError(404, 'ARTISAN_PROFILE_NOT_FOUND', 'Artisan profile not found');
  }

  const { data, error } = await supabaseAdmin
    .from('service_areas')
    .insert({ artisan_id: ap.id, ...payload })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to add service area: ${error.message}`);
  }
  return data;
}

/**
 * Delete a service area — only if it belongs to the authenticated artisan.
 */
export async function removeServiceArea(userId: string, areaId: string): Promise<void> {
  const { data: ap, error: apErr } = await supabaseAdmin
    .from('artisan_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (apErr || !ap) {
    throw new ApiError(404, 'ARTISAN_PROFILE_NOT_FOUND', 'Artisan profile not found');
  }

  const { error } = await supabaseAdmin
    .from('service_areas')
    .delete()
    .eq('id', areaId)
    .eq('artisan_id', ap.id);

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to remove service area: ${error.message}`);
  }
}
