import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../types/api';
import { getMyProfile, updateMyProfile } from '../services/auth.service';
import { ApiError } from '../middleware/errorHandler';
import { UpdateProfileInput } from '../validators/profile.validator';

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
 * Updates allowed profile fields.
 * Body has already been validated by the Zod middleware on the router.
 * Role changes are rejected at the validator level (field not in schema).
 */
export async function updateMyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extra guard — reject any role field that slipped through
    if ('role' in req.body) {
      return next(new ApiError(403, 'FORBIDDEN', 'You cannot change your own role'));
    }

    const input = req.body as UpdateProfileInput;

    // Strip undefined values so we don't write nulls for omitted fields
    const payload = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined)
    ) as Partial<UpdateProfileInput>;

    if (Object.keys(payload).length === 0) {
      return next(new ApiError(400, 'VALIDATION_ERROR', 'No updatable fields provided'));
    }

    const profile = await updateMyProfile(req.user!.id, payload);
    sendSuccess(res, profile, 'Profile updated');
  } catch (err) {
    next(err);
  }
}
