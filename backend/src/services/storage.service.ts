import { supabaseAdmin } from '../config/supabase';
import { ApiError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

// Bucket names — must exist in Supabase Storage
const BUCKET_AVATARS = 'avatars';
const BUCKET_PORTFOLIO = 'portfolio';
const BUCKET_DOCUMENTS = 'verification-documents';

function getExtension(mimetype: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  };
  return map[mimetype] ?? 'bin';
}

/**
 * Upload an avatar image for a user.
 * Returns the public URL of the uploaded file.
 * Old avatar files are replaced (same path structure).
 */
export async function uploadAvatar(
  userId: string,
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  await ensureBucket(BUCKET_AVATARS, true);

  const ext = getExtension(mimetype);
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabaseAdmin.storage.from(BUCKET_AVATARS).upload(path, buffer, {
    contentType: mimetype,
    upsert: true, // overwrite existing avatar
  });

  if (error) {
    throw new ApiError(500, 'STORAGE_ERROR', `Failed to upload avatar: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(BUCKET_AVATARS).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload a portfolio image for an artisan.
 * Returns the public URL.
 */
export async function uploadPortfolioImage(
  artisanId: string,
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  await ensureBucket(BUCKET_PORTFOLIO, true);

  const ext = getExtension(mimetype);
  const path = `${artisanId}/${uuidv4()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_PORTFOLIO)
    .upload(path, buffer, { contentType: mimetype });

  if (error) {
    throw new ApiError(500, 'STORAGE_ERROR', `Failed to upload portfolio image: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(BUCKET_PORTFOLIO).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload a verification document (private — no public URL returned).
 * Returns the storage path for admin retrieval via signed URL.
 */
export async function uploadVerificationDocument(
  artisanId: string,
  buffer: Buffer,
  mimetype: string,
  documentType: string
): Promise<string> {
  await ensureBucket(BUCKET_DOCUMENTS, false);

  const ext = getExtension(mimetype);
  const path = `${artisanId}/${documentType}-${uuidv4()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_DOCUMENTS)
    .upload(path, buffer, { contentType: mimetype });

  if (error) {
    throw new ApiError(500, 'STORAGE_ERROR', `Failed to upload document: ${error.message}`);
  }

  // Return the internal path — admins generate signed URLs on demand
  return path;
}

/**
 * Generate a short-lived signed URL for a private document (admin use).
 */
export async function getSignedDocumentUrl(path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_DOCUMENTS)
    .createSignedUrl(path, expiresIn);

  if (error || !data) {
    throw new ApiError(500, 'STORAGE_ERROR', `Failed to create signed URL: ${error?.message}`);
  }

  return data.signedUrl;
}

// ── Helpers ────────────────────────────────────────────────────

async function ensureBucket(name: string, isPublic: boolean): Promise<void> {
  const { data: existing } = await supabaseAdmin.storage.getBucket(name);
  if (existing) return;

  const { error } = await supabaseAdmin.storage.createBucket(name, {
    public: isPublic,
    fileSizeLimit: isPublic ? 5 * 1024 * 1024 : 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  });

  if (error && !error.message.includes('already exists')) {
    throw new ApiError(500, 'STORAGE_ERROR', `Failed to create bucket: ${error.message}`);
  }
}
