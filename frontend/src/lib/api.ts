/**
 * Base API client for communicating with the HandyNG Express backend.
 *
 * All requests go through this module so we have a single place to:
 *  - set the base URL from environment variables
 *  - attach auth headers in later phases
 *  - handle common error shapes
 */

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

// ── Shared response shape ──────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ── Custom error class ─────────────────────────────────────────

export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

// ── Core fetch wrapper ─────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiSuccess<T>> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const body: ApiResponse<T> = await res.json();

  if (!body.success) {
    throw new ApiRequestError(body.error.code, body.error.message, res.status);
  }

  return body;
}

// ── Public helpers ─────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),

  patch: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { method: 'DELETE', ...options }),
};
