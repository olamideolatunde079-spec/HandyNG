import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated } from '../types/api';
import {
  createReview,
  getArtisanReviews,
  getMyReviewsAsCustomer,
  getReviewByRequestId,
} from '../services/reviews.service';
import { CreateReviewInput } from '../validators/review.validator';

/**
 * POST /api/v1/reviews
 * Customer submits a review for a completed service request.
 */
export async function createReviewHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as CreateReviewInput;
    const review = await createReview(req.user!.id, input);
    sendCreated(res, review, 'Review submitted successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/reviews
 * List reviews.
 *
 * Query params:
 *   artisan_id  — list reviews for an artisan (public)
 *   my          — list reviews submitted by the authenticated customer
 *   request_id  — get review for a specific request (must be owner)
 */
export async function listReviewsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { artisan_id, my, request_id } = req.query as Record<string, string | undefined>;

    if (request_id) {
      const review = await getReviewByRequestId(request_id, req.user!.id);
      sendSuccess(res, review);
      return;
    }

    if (my) {
      const reviews = await getMyReviewsAsCustomer(req.user!.id);
      sendSuccess(res, reviews);
      return;
    }

    if (artisan_id) {
      const reviews = await getArtisanReviews(artisan_id);
      sendSuccess(res, reviews);
      return;
    }

    sendSuccess(res, []);
  } catch (err) {
    next(err);
  }
}
