import { api } from '@/lib/api';
import { ArtisanProfile, ServiceArea, Service, Review } from '@/types/database';

// ── Types ──────────────────────────────────────────────────────

export interface ArtisanListItem {
  id: string;
  user_id: string;
  business_name: string | null;
  bio: string | null;
  years_experience: number | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  average_rating: number;
  total_reviews: number;
  completed_jobs: number;
  service_radius: number | null;
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
  services: Array<
    Pick<
      Service,
      'id' | 'name' | 'description' | 'pricing_type' | 'price_from' | 'price_to' | 'is_active'
    > & {
      service_categories: { name: string; slug: string; icon: string | null } | null;
    }
  >;
  service_areas: ServiceArea[];
  portfolio: Array<{ id: string; title: string; description: string | null; image_url: string }>;
  reviews: Array<Pick<Review, 'id' | 'rating' | 'comment' | 'created_at'>>;
}

export interface ArtisanFilterParams {
  search?: string;
  category?: string;
  state?: string;
  city?: string;
  verified?: boolean;
  min_rating?: number;
  page?: number;
  limit?: number;
}

// ── API calls ──────────────────────────────────────────────────

export async function fetchArtisans(params: ArtisanFilterParams = {}): Promise<ArtisanListResult> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.category) qs.set('category', params.category);
  if (params.state) qs.set('state', params.state);
  if (params.city) qs.set('city', params.city);
  if (params.verified) qs.set('verified', 'true');
  if (params.min_rating) qs.set('min_rating', String(params.min_rating));
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));

  const res = await api.get<ArtisanListResult>(`/api/v1/artisans?${qs.toString()}`);
  return res.data;
}

export async function fetchArtisanProfile(id: string): Promise<ArtisanFullProfile> {
  const res = await api.get<ArtisanFullProfile>(`/api/v1/artisans/${id}`);
  return res.data;
}
