import multer from 'multer';
import { Request } from 'express';
import { ApiError } from './errorHandler';

// ── Allowed MIME types ─────────────────────────────────────────
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

// ── File size limits ───────────────────────────────────────────
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_PORTFOLIO_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG and WEBP images are allowed'));
  }
}

/**
 * Avatar upload — 2 MB limit, memory storage (passed directly to Supabase Storage).
 */
export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE },
  fileFilter,
});

/**
 * Portfolio image upload — 5 MB limit.
 */
export const portfolioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PORTFOLIO_SIZE },
  fileFilter,
});

/**
 * Verification document upload — 10 MB limit (also allows PDF in future).
 */
export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter,
});
