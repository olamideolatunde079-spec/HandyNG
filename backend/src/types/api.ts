/**
 * Shared API response types and builder helpers.
 * Every route handler must use these to keep responses consistent.
 */

import { Response } from 'express';

// ── Response shapes ────────────────────────────────────────────

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ── Builder helpers ────────────────────────────────────────────

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Request successful',
  statusCode = 200
): void {
  const body: SuccessResponse<T> = { success: true, data, message };
  res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message = 'Created successfully'): void {
  sendSuccess(res, data, message, 201);
}

export function sendError(res: Response, statusCode: number, code: string, message: string): void {
  const body: ErrorResponse = { success: false, error: { code, message } };
  res.status(statusCode).json(body);
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedData<T> {
  return {
    items,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}
