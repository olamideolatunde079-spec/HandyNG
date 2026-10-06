import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated } from '../types/api';
import {
  getMyArtisanProfile,
  getArtisanProfileById,
  updateMyArtisanProfile,
  getMyServiceAreas,
  addServiceArea,
  removeServiceArea,
} from '../services/artisans.service';
import { UpdateArtisanProfileInput } from '../validators/profile.validator';

// ── Artisan profile ────────────────────────────────────────────

/**
 * GET /api/v1/artisans/me
 * Returns the authenticated artisan's full profile.
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await getMyArtisanProfile(req.user!.id);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/artisans/:id
 * Returns a public artisan profile by artisan_profiles.id (not user_id).
 */
export async function getArtisan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const profile = await getArtisanProfileById(id);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/artisans/me
 * Updates the authenticated artisan's profile.
 * Body is pre-validated by Zod middleware on the router.
 */
export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as UpdateArtisanProfileInput;

    const payload = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined)
    ) as Partial<UpdateArtisanProfileInput>;

    const profile = await updateMyArtisanProfile(req.user!.id, payload);
    sendSuccess(res, profile, 'Artisan profile updated');
  } catch (err) {
    next(err);
  }
}

// ── Service areas ──────────────────────────────────────────────

/**
 * GET /api/v1/artisans/me/areas
 */
export async function listMyAreas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const areas = await getMyServiceAreas(req.user!.id);
    sendSuccess(res, areas, `${areas.length} service area(s)`);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/artisans/me/areas
 */
export async function addArea(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const area = await addServiceArea(req.user!.id, req.body);
    sendCreated(res, area, 'Service area added');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/artisans/me/areas/:areaId
 */
export async function removeArea(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await removeServiceArea(req.user!.id, req.params.areaId);
    sendSuccess(res, null, 'Service area removed');
  } catch (err) {
    next(err);
  }
}
