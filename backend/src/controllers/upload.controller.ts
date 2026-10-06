import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../types/api';
import { uploadAvatar } from '../services/storage.service';
import { supabaseAdmin } from '../config/supabase';
import { ApiError } from '../middleware/errorHandler';

/**
 * POST /api/v1/upload/avatar
 * Uploads a profile picture and updates the profiles.avatar_url column.
 * Requires: multipart/form-data with field "avatar" (image file).
 */
export async function uploadAvatarHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'MISSING_FILE', 'No image file provided'));
    }

    const { buffer, mimetype } = req.file;

    // Upload to Supabase Storage
    const publicUrl = await uploadAvatar(req.user!.id, buffer, mimetype);

    // Update the profile row with the new avatar URL
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', req.user!.id);

    if (error) {
      throw new ApiError(500, 'DB_ERROR', `Failed to update avatar URL: ${error.message}`);
    }

    sendSuccess(res, { avatar_url: publicUrl }, 'Avatar uploaded successfully');
  } catch (err) {
    next(err);
  }
}
