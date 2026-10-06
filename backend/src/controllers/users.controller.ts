import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../types/api';
import { getMyProfile, updateMyProfile } from '../services/auth.service';
import { ApiError } from '../middleware/errorHandler';

/**
 * GET /api/v1/users/me
 * Returns the authenticated user's profile.
 */
export async function getMyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await getMyProfile(req.user!.id);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/me
 * Updates the authenticated user's profile fields.
 * Users cannot change their own role — that's an admin operation.
 */
export async function updateMyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { first_name, last_name, phone, city, state, address } = req.body as {
      first_name?: string;
      last_name?: string;
      phone?: string;
      city?: string;
      state?: string;
      address?: string;
    };

    // Reject any attempt to change the role via this endpoint
    if ('role' in req.body) {
      return next(new ApiError(403, 'FORBIDDEN', 'You cannot change your own role'));
    }

    const payload = Object.fromEntries(
      Object.entries({ first_name, last_name, phone, city, state, address }).filter(
        ([, v]) => v !== undefined
      )
    );

    if (Object.keys(payload).length === 0) {
      return next(new ApiError(400, 'VALIDATION_ERROR', 'No updatable fields provided'));
    }

    const profile = await updateMyProfile(req.user!.id, payload);
    sendSuccess(res, profile, 'Profile updated');
  } catch (err) {
    next(err);
  }
}
