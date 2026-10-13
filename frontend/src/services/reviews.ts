import { api } from '@/lib/api';
import { Review } from '@/types/database';

export interface PopulatedReview extends Review {
  customer?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
  service_request?: {
    title: string;
  } | null;
}

export interface CreateReviewPayload {
  service_request_id: string;
  rating: number;
  comment?: string | null;
}

/**
 * Submit a review for a completed service request.
 */
export async function submitReview(
  token: string,
  payload: CreateReviewPayload
): Promise<Review> {
  const res = await api.post<Review>('/api/v1/reviews', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Fetch all reviews for an artisan (public, but requires auth for API call).
 */
export async function fetchArtisanReviews(
  token: string,
  artisanId: string
): Promise<PopulatedReview[]> {
  const res = await api.get<PopulatedReview[]>(`/api/v1/reviews?artisan_id=${encodeURIComponent(artisanId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Fetch reviews submitted by the authenticated customer.
 */
export async function fetchMyReviews(token: string): Promise<PopulatedReview[]> {
  const res = await api.get<PopulatedReview[]>('/api/v1/reviews?my=1', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Check if a review exists for a specific completed request.
 */
export async function fetchReviewForRequest(
  token: string,
  requestId: string
): Promise<Review | null> {
  const res = await api.get<Review | null>(
    `/api/v1/reviews?request_id=${encodeURIComponent(requestId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}
