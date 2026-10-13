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

// ── Public listing + search ────────────────────────────────────

export interface ArtisanFilter {
  search?: string; // matches business_name or profile name
  category?: string; // category slug
  state?: string; // service area state
  city?: string; // service area city
  verified?: boolean; // only verified artisans
  minRating?: number; // minimum average_rating
  page?: number;
  limit?: number;
}

export interface ArtisanListItem {
  id: string;
  user_id: string;
  business_name: string | null;
  bio: string | null;
  years_experience: number | null;
  verification_status: string;
  average_rating: number;
  total_reviews: number;
  completed_jobs: number;
  service_radius: number | null;
  // joined from profiles
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    city: string | null;
    state: string | null;
  } | null;
}

export interface ArtisanListResult {
  items: ArtisanListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * List artisans with optional search + filters.
 * Returns paginated results (default 20 per page).
 */
export async function listArtisans(filter: ArtisanFilter = {}): Promise<ArtisanListResult> {
  const page = Math.max(1, filter.page ?? 1);
  const limit = Math.min(50, Math.max(1, filter.limit ?? 20));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin.from('artisan_profiles').select(
    `id, user_id, business_name, bio, years_experience, verification_status,
       average_rating, total_reviews, completed_jobs, service_radius`,
    { count: 'exact' }
  );

  // Verified filter
  if (filter.verified) {
    query = query.eq('verification_status', 'verified');
  }

  // Minimum rating
  if (filter.minRating != null) {
    query = query.gte('average_rating', filter.minRating);
  }

  // Category filter — artisan must have at least one active service in that category
  if (filter.category) {
    const { data: cat } = await supabaseAdmin
      .from('service_categories')
      .select('id')
      .eq('slug', filter.category)
      .single();

    if (cat) {
      const { data: artisanIds } = await supabaseAdmin
        .from('services')
        .select('artisan_id')
        .eq('category_id', cat.id)
        .eq('is_active', true);

      const ids = [...new Set((artisanIds ?? []).map((r) => r.artisan_id))];
      if (ids.length === 0) {
        return { items: [], total: 0, page, limit, hasMore: false };
      }
      query = query.in('id', ids);
    }
  }

  // Location filter — artisan must cover that state/city
  if (filter.state || filter.city) {
    let areaQuery = supabaseAdmin.from('service_areas').select('artisan_id');
    if (filter.state) areaQuery = areaQuery.ilike('state', `%${filter.state}%`);
    if (filter.city) areaQuery = areaQuery.ilike('city', `%${filter.city}%`);
    const { data: areaRows } = await areaQuery;
    const ids = [...new Set((areaRows ?? []).map((r) => r.artisan_id))];
    if (ids.length === 0) {
      return { items: [], total: 0, page, limit, hasMore: false };
    }
    query = query.in('id', ids);
  }

  // Sort: verified first, then by rating
  query = query.order('average_rating', { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to list artisans: ${error.message}`);
  }

  const rawArtisans = (data ?? []) as unknown as Omit<ArtisanListItem, 'profiles'>[];
  const userIds = rawArtisans.map((a) => a.user_id);

  const profileMap = new Map<string, ArtisanListItem['profiles']>();
  if (userIds.length > 0) {
    const { data: profs } = await supabaseAdmin
      .from('profiles')
      .select('user_id, first_name, last_name, avatar_url, city, state')
      .in('user_id', userIds);

    if (profs) {
      for (const p of profs) {
        profileMap.set(p.user_id, {
          first_name: p.first_name,
          last_name: p.last_name,
          avatar_url: p.avatar_url,
          city: p.city,
          state: p.state,
        });
      }
    }
  }

  let items: ArtisanListItem[] = rawArtisans.map((a) => ({
    ...a,
    profiles: profileMap.get(a.user_id) ?? null,
  }));

  // If search term provided, filter in-memory (simple name match)
  if (filter.search) {
    const term = filter.search.toLowerCase();
    items = items.filter((a) => {
      const fullName =
        `${a.profiles?.first_name ?? ''} ${a.profiles?.last_name ?? ''}`.toLowerCase();
      const biz = (a.business_name ?? '').toLowerCase();
      return fullName.includes(term) || biz.includes(term);
    });
  }

  const total = count ?? 0;
  return { items, total, page, limit, hasMore: page * limit < total };
}

// ── Full public artisan profile ────────────────────────────────

export interface ArtisanFullProfile {
  artisan: ArtisanProfile;
  profile: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    city: string | null;
    state: string | null;
    phone: string | null;
  };
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    pricing_type: string;
    price_from: number | null;
    price_to: number | null;
    is_active: boolean;
    service_categories: { name: string; slug: string; icon: string | null } | null;
  }>;
  service_areas: ServiceArea[];
  portfolio: Array<{
    id: string;
    title: string;
    description: string | null;
    image_url: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
  }>;
}

/**
 * Fetch full public artisan profile by artisan_profiles.id.
 * Includes services, service areas, portfolio, and recent reviews.
 */
export async function getFullArtisanProfile(artisanId: string): Promise<ArtisanFullProfile> {
  // Fetch artisan profile
  const { data: artisan, error: artErr } = await supabaseAdmin
    .from('artisan_profiles')
    .select('*')
    .eq('id', artisanId)
    .single();

  if (artErr || !artisan) {
    throw new ApiError(404, 'NOT_FOUND', 'Artisan not found');
  }

  // Fetch base profile (name, avatar)
  const { data: prof } = await supabaseAdmin
    .from('profiles')
    .select('first_name, last_name, avatar_url, city, state, phone')
    .eq('user_id', artisan.user_id)
    .single();

  // Fetch active services with category info
  const { data: services } = await supabaseAdmin
    .from('services')
    .select(
      'id, name, description, pricing_type, price_from, price_to, is_active, service_categories(name, slug, icon)'
    )
    .eq('artisan_id', artisanId)
    .eq('is_active', true)
    .order('name');

  // Fetch service areas
  const { data: areas } = await supabaseAdmin
    .from('service_areas')
    .select('*')
    .eq('artisan_id', artisanId)
    .order('state');

  // Fetch portfolio items
  const { data: portfolio } = await supabaseAdmin
    .from('portfolio_items')
    .select('id, title, description, image_url')
    .eq('artisan_id', artisanId)
    .order('created_at', { ascending: false });

  // Fetch recent reviews (last 10)
  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('id, rating, comment, created_at')
    .eq('artisan_id', artisanId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    artisan: artisan as ArtisanProfile,
    profile: prof ?? {
      first_name: '',
      last_name: '',
      avatar_url: null,
      city: null,
      state: null,
      phone: null,
    },
    services: (services ?? []) as unknown as ArtisanFullProfile['services'],
    service_areas: (areas ?? []) as ServiceArea[],
    portfolio: portfolio ?? [],
    reviews: reviews ?? [],
  };
}
