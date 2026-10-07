import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated } from '../types/api';
import {
  getMyServices,
  createMyService,
  updateMyService,
  deleteMyService,
  getServicesByArtisan,
  getServicesByCategory,
} from '../services/services.service';
import { CreateServiceInput, UpdateServiceInput } from '../validators/service.validator';

// ── Public ─────────────────────────────────────────────────────

/**
 * GET /api/v1/services?artisan_id=&category_slug=
 */
export async function listServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { artisan_id, category_slug } = req.query as {
      artisan_id?: string;
      category_slug?: string;
    };

    if (artisan_id) {
      const services = await getServicesByArtisan(artisan_id);
      sendSuccess(res, services, `${services.length} service(s) found`);
      return;
    }

    if (category_slug) {
      const services = await getServicesByCategory(category_slug);
      sendSuccess(res, services, `${services.length} service(s) found`);
      return;
    }

    // No filter — return empty rather than all services (too many)
    sendSuccess(res, [], 'Provide artisan_id or category_slug to filter');
  } catch (err) {
    next(err);
  }
}

// ── Artisan-owned ──────────────────────────────────────────────

/**
 * GET /api/v1/services/me
 */
export async function listMyServices(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const services = await getMyServices(req.user!.id);
    sendSuccess(res, services, `${services.length} service(s)`);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/services
 */
export async function createService(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const service = await createMyService(req.user!.id, req.body as CreateServiceInput);
    sendCreated(res, service, 'Service created');
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/services/:id
 */
export async function updateService(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const service = await updateMyService(
      req.user!.id,
      req.params.id,
      req.body as Partial<UpdateServiceInput>
    );
    sendSuccess(res, service, 'Service updated');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/services/:id
 */
export async function deleteService(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await deleteMyService(req.user!.id, req.params.id);
    sendSuccess(res, null, 'Service deleted');
  } catch (err) {
    next(err);
  }
}
