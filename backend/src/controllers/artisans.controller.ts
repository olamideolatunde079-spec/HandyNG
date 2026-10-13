import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated } from '../types/api';
import {
  getMyArtisanProfile,
  updateMyArtisanProfile,
  getMyServiceAreas,
  addServiceArea,
  removeServiceArea,
  listArtisans,
  getFullArtisanProfile,
  ArtisanFilter,
} from '../services/artisans.service';
import { UpdateArtisanProfileInput } from '../validators/profile.validator';

// ── Public listing ─────────────────────────────────────────────

/**
 * GET /api/v1/artisans
 * Public artisan listing with optional search + filters.
 *
 * Query params:
 *   search      string  — name or business name
 *   category    string  — category slug
 *   state       string  — service area state
 *   city        string  — service area city
 *   verified    boolean — only verified artisans
 *   min_rating  number  — minimum average rating
 *   page        number  — page number (default 1)
 *   limit       number  — items per page (default 20, max 50)
 */
export async function listArtisansHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { search, category, state, city, verified, min_rating, page, limit } =
      req.query as Record<string, string | undefined>;

    const filter: ArtisanFilter = {
      search: search || undefined,
      category: category || undefined,
      state: state || undefined,
      city: city || undefined,
      verified: verified === 'true' ? true : undefined,
      minRating: min_rating ? parseFloat(min_rating) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    const result = await listArtisans(filter);
    sendSuccess(res, result, `${result.total} artisan(s) found`);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/artisans/:id
 * Full public artisan profile — includes services, areas, portfolio, reviews.
 */
export async function getArtisan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const full = await getFullArtisanProfile(req.params.id);
    sendSuccess(res, full);
  } catch (err) {
    next(err);
  }
}

// ── Authenticated artisan (self) ───────────────────────────────

/**
 * GET /api/v1/artisans/me
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
 * PATCH /api/v1/artisans/me
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

export async function listMyAreas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const areas = await getMyServiceAreas(req.user!.id);
    sendSuccess(res, areas, `${areas.length} service area(s)`);
  } catch (err) {
    next(err);
  }
}

export async function addArea(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const area = await addServiceArea(req.user!.id, req.body);
    sendCreated(res, area, 'Service area added');
  } catch (err) {
    next(err);
  }
}

export async function removeArea(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await removeServiceArea(req.user!.id, req.params.areaId);
    sendSuccess(res, null, 'Service area removed');
  } catch (err) {
    next(err);
  }
}
