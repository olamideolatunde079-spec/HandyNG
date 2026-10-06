import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../types/api';
import { getMyProfile } from '../services/auth.service';

/**
 * GET /api/v1/auth/me
 * Returns the JWT claims + profile for the currently authenticated user.
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await getMyProfile(req.user!.id);

    sendSuccess(res, {
      // JWT identity
      auth: {
        id: req.user!.id,
        email: req.user!.email,
        role: req.user!.role,
      },
      // Database profile
      profile,
    });
  } catch (err) {
    next(err);
  }
}
