/**
 * Frontend database entity types — mirrors the backend schema types.
 */

export type UserRole = 'customer' | 'artisan' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type PricingType = 'fixed' | 'starting_from' | 'negotiable' | 'inspection_required';
export type RequestStatus =
  'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';

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
  average_rating: number;
  total_reviews: number;
  completed_jobs: number;
  created_at: string;
  updated_at: string;
}
