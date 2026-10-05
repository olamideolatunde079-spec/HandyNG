/**
 * Shared API types for the frontend — mirrors the backend response shape.
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
