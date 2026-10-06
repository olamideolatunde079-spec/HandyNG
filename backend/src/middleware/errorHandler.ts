import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Structured API error class.
 * Throw this anywhere in route handlers or services and the
 * centralized handler will format it correctly.
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Shape used by the validate() middleware in profile.validator.ts
interface PlainErrorObject {
  statusCode: number;
  code: string;
  message: string;
}

function isPlainError(err: unknown): err is PlainErrorObject {
  return (
    typeof err === 'object' &&
    err !== null &&
    'statusCode' in err &&
    'code' in err &&
    'message' in err
  );
}

/**
 * 404 handler — registered after all routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

/**
 * Centralized error handler — must be the last middleware registered.
 */
export function errorHandler(
  err: Error | PlainErrorObject,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (isPlainError(err)) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  // Log unexpected errors server-side only
  console.error('[Unhandled Error]', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.isDev ? (err as Error).message : 'An unexpected error occurred',
    },
  });
}
