import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated } from '../types/api';
import {
  createRequest,
  getMyCustomerRequests,
  getMyArtisanRequests,
  getRequestById,
  updateRequestStatus,
} from '../services/requests.service';
import { CreateRequestInput, UpdateRequestStatusInput } from '../validators/request.validator';
import { RequestStatus } from '../types/database';

/**
 * POST /api/v1/requests
 * Customer creates a new service request.
 */
export async function createRequestHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as CreateRequestInput;
    const request = await createRequest(req.user!.id, input);
    sendCreated(res, request, 'Service request submitted successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/requests
 * List service requests for the authenticated user.
 * - If customer: returns requests created by the customer
 * - If artisan: returns requests assigned to the artisan
 *
 * Query params:
 *   status: string ('pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled')
 */
export async function listRequestsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const statusFilter = req.query.status as RequestStatus | undefined;
    const role = req.user!.role;

    if (role === 'artisan') {
      const requests = await getMyArtisanRequests(req.user!.id, statusFilter);
      sendSuccess(res, requests);
    } else {
      const requests = await getMyCustomerRequests(req.user!.id, statusFilter);
      sendSuccess(res, requests);
    }
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/requests/:id
 * Get single request details.
 */
export async function getRequestHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = await getRequestById(req.params.id, req.user!.id, req.user!.role);
    sendSuccess(res, request);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/requests/:id
 * Update status of request (accept, reject, in_progress, completed, cancel).
 */
export async function updateRequestHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as UpdateRequestStatusInput;
    const updated = await updateRequestStatus(req.params.id, req.user!.id, req.user!.role, input);
    sendSuccess(res, updated, `Request status updated to ${updated.status}`);
  } catch (err) {
    next(err);
  }
}
