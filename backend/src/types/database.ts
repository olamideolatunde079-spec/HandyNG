/**
 * TypeScript types that mirror the Supabase PostgreSQL schema.
 * Keep these in sync with the migration files.
 */

// ── Enums ──────────────────────────────────────────────────────

export type UserRole = 'customer' | 'artisan' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type PricingType = 'fixed' | 'starting_from' | 'negotiable' | 'inspection_required';
export type RequestStatus =
  'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
export type ReportStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

// ── Table row types ────────────────────────────────────────────

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  city: string | null;
  state: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtisanProfile {
  id: string;
  user_id: string;
  business_name: string | null;
  bio: string | null;
  years_experience: number | null;
  verification_status: VerificationStatus;
  verification_submitted_at: string | null;
  verified_at: string | null;
  service_radius: number | null;
  average_rating: number;
  total_reviews: number;
  completed_jobs: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  artisan_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_from: number | null;
  price_to: number | null;
  pricing_type: PricingType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceArea {
  id: string;
  artisan_id: string;
  city: string;
  state: string;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_km: number | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  artisan_id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  artisan_id: string;
  service_id: string | null;
  title: string;
  description: string;
  location: string;
  preferred_date: string | null;
  preferred_time: string | null;
  status: RequestStatus;
  estimated_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  customer_id: string;
  artisan_id: string;
  service_request_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  service_request_id: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequest {
  id: string;
  artisan_id: string;
  document_type: string;
  document_url: string;
  status: VerificationStatus;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  updated_at: string;
}
