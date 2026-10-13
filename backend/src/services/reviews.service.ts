import { supabaseAdmin } from '../config/supabase';
import { ApiError } from '../middleware/errorHandler';
import { Review } from '../types/database';
import { CreateReviewInput } from '../validators/review.validator';

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

/**
 * Create a review for a completed service request.
 * Rules:
 *  - Only the customer who owns the request may review.
 *  - The request must be in `completed` status.
 *  - Only one review allowed per completed request (DB unique constraint).
 */
export async function createReview(
  customerId: string,
  input: CreateReviewInput
): Promise<Review> {
  // Fetch the service request, verify ownership + completion
  const { data: req, error: reqErr } = await supabaseAdmin
    .from('service_requests')
    .select('id, customer_id, artisan_id, status')
    .eq('id', input.service_request_id)
    .single();

  if (reqErr || !req) {
    throw new ApiError(404, 'NOT_FOUND', 'Service request not found');
  }

  if (req.customer_id !== customerId) {
    throw new ApiError(403, 'FORBIDDEN', 'You can only review your own service requests');
  }

  if (req.status !== 'completed') {
    throw new ApiError(
      400,
      'REQUEST_NOT_COMPLETED',
      'You can only leave a review after the job has been completed'
    );
  }

  // Check if review already exists for this request
  const { data: existing } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('service_request_id', input.service_request_id)
    .maybeSingle();

  if (existing) {
    throw new ApiError(409, 'REVIEW_EXISTS', 'You have already reviewed this service request');
  }

  const { data: review, error: insErr } = await supabaseAdmin
    .from('reviews')
    .insert({
      customer_id: customerId,
      artisan_id: req.artisan_id,
      service_request_id: input.service_request_id,
      rating: input.rating,
      comment: input.comment ?? null,
    })
    .select()
    .single();

  if (insErr || !review) {
    throw new ApiError(500, 'DB_ERROR', `Failed to create review: ${insErr?.message}`);
  }

  return review;
}

/**
 * Get all reviews for a given artisan profile (by artisan_profiles.id).
 */
export async function getArtisanReviews(artisanId: string): Promise<PopulatedReview[]> {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('*, service_requests(title)')
    .eq('artisan_id', artisanId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to fetch reviews: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as Array<
    Review & { service_requests: { title: string } | null }
  >;

  // Batch-fetch customer profiles
  const customerIds = [...new Set(rows.map((r) => r.customer_id))];
  const profileMap = new Map<string, { first_name: string; last_name: string; avatar_url: string | null }>();

  if (customerIds.length > 0) {
    const { data: profs } = await supabaseAdmin
      .from('profiles')
      .select('user_id, first_name, last_name, avatar_url')
      .in('user_id', customerIds);

    for (const p of (profs ?? []) as Array<{
      user_id: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    }>) {
      profileMap.set(p.user_id, { first_name: p.first_name, last_name: p.last_name, avatar_url: p.avatar_url });
    }
  }

  return rows.map((r) => ({
    id: r.id,
    customer_id: r.customer_id,
    artisan_id: r.artisan_id,
    service_request_id: r.service_request_id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    updated_at: r.updated_at,
    customer: profileMap.get(r.customer_id) ?? null,
    service_request: r.service_requests ?? null,
  }));
}

/**
 * Get all reviews left by a customer.
 */
export async function getMyReviewsAsCustomer(customerId: string): Promise<PopulatedReview[]> {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select(
      `*,
       service_requests(title),
       artisan_profiles(id, business_name, user_id)`
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to fetch reviews: ${error.message}`);
  }

  return (data ?? []) as unknown as PopulatedReview[];
}

/**
 * Get review for a specific completed request (if any).
 */
export async function getReviewByRequestId(
  serviceRequestId: string,
  customerId: string
): Promise<Review | null> {
  const { data: req } = await supabaseAdmin
    .from('service_requests')
    .select('customer_id')
    .eq('id', serviceRequestId)
    .single();

  if (!req || req.customer_id !== customerId) {
    throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
  }

  const { data } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('service_request_id', serviceRequestId)
    .maybeSingle();

  return data ?? null;
}
