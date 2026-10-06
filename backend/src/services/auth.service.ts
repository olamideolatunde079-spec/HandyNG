import { supabaseAdmin } from '../config/supabase';
import { Profile } from '../types/database';
import { ApiError } from '../middleware/errorHandler';

/**
 * Fetch the full profile for the authenticated user.
 * Creates a minimal profile row if one doesn't exist yet
 * (edge case: user registered but trigger hasn't fired).
 */
export async function getMyProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new ApiError(500, 'DB_ERROR', `Failed to fetch profile: ${error.message}`);
  }

  if (!data) {
    throw new ApiError(
      404,
      'PROFILE_NOT_FOUND',
      'Profile not found. Complete your registration to create one.'
    );
  }

  return data;
}

/**
 * Upsert a profile row.
 * Called during or after registration to ensure the profile exists.
 */
export async function upsertProfile(
  userId: string,
  payload: Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & {
    first_name: string;
    last_name: string;
  }
): Promise<Profile> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert({ user_id: userId, ...payload }, { onConflict: 'user_id', ignoreDuplicates: false })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to upsert profile: ${error.message}`);
  }

  return data;
}

/**
 * Update specific fields on the authenticated user's profile.
 */
export async function updateMyProfile(
  userId: string,
  payload: Partial<
    Pick<Profile, 'first_name' | 'last_name' | 'phone' | 'city' | 'state' | 'address'>
  >
): Promise<Profile> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(payload)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    throw new ApiError(500, 'DB_ERROR', `Failed to update profile: ${error?.message}`);
  }

  return data;
}
