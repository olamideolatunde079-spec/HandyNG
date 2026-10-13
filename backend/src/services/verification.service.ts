import { supabaseAdmin } from '../config/supabase';
import { ApiError } from '../middleware/errorHandler';
import { VerificationRequest } from '../types/database';
import { uploadVerificationDocument, getSignedDocumentUrl } from './storage.service';
import { SubmitVerificationInput, ReviewVerificationInput } from '../validators/verification.validator';

export interface PopulatedVerificationRequest extends VerificationRequest {
  artisan?: {
    id: string;
    business_name: string | null;
    user_id: string;
    user?: {
      first_name: string;
      last_name: string;
      email?: string;
    } | null;
  } | null;
  signed_url?: string;
}

/**
 * Artisan submits a verification document.
 * Only one pending submission is allowed at a time.
 */
export async function submitVerification(
  artisanUserId: string,
  input: SubmitVerificationInput,
  fileBuffer: Buffer,
  fileMimetype: string
): Promise<VerificationRequest> {
  // Resolve artisan profile ID
  const { data: ap, error: apErr } = await supabaseAdmin
    .from('artisan_profiles')
    .select('id, verification_status')
    .eq('user_id', artisanUserId)
    .single();

  if (apErr || !ap) {
    throw new ApiError(404, 'ARTISAN_PROFILE_NOT_FOUND', 'Artisan profile not found');
  }

  if (ap.verification_status === 'verified') {
    throw new ApiError(400, 'ALREADY_VERIFIED', 'Your profile is already verified');
  }

  // Check for existing pending submission
  const { data: existing } = await supabaseAdmin
    .from('verification_requests')
    .select('id, status')
    .eq('artisan_id', ap.id)
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    throw new ApiError(
      409,
      'PENDING_SUBMISSION_EXISTS',
      'You already have a pending verification request. Please wait for admin review.'
    );
  }

  // Upload document to private storage
  const documentPath = await uploadVerificationDocument(
    ap.id,
    fileBuffer,
    fileMimetype,
    input.document_type
  );

  const { data: vr, error: vrErr } = await supabaseAdmin
    .from('verification_requests')
    .insert({
      artisan_id: ap.id,
      document_type: input.document_type,
      document_url: documentPath,
      status: 'pending',
    })
    .select()
    .single();

  if (vrErr || !vr) {
    throw new ApiError(500, 'DB_ERROR', `Failed to submit verification: ${vrErr?.message}`);
  }

  // Update artisan's verification_submitted_at timestamp
  await supabaseAdmin
    .from('artisan_profiles')
    .update({ verification_submitted_at: new Date().toISOString() })
    .eq('id', ap.id);

  return vr;
}

/**
 * Get verification status for the authenticated artisan.
 */
export async function getMyVerificationStatus(artisanUserId: string): Promise<{
  verification_status: string;
  verification_submitted_at: string | null;
  latest_request: VerificationRequest | null;
}> {
  const { data: ap, error: apErr } = await supabaseAdmin
    .from('artisan_profiles')
    .select('id, verification_status, verification_submitted_at')
    .eq('user_id', artisanUserId)
    .single();

  if (apErr || !ap) {
    throw new ApiError(404, 'ARTISAN_PROFILE_NOT_FOUND', 'Artisan profile not found');
  }

  const { data: latestReq } = await supabaseAdmin
    .from('verification_requests')
    .select('*')
    .eq('artisan_id', ap.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    verification_status: ap.verification_status,
    verification_submitted_at: ap.verification_submitted_at,
    latest_request: latestReq ?? null,
  };
}

/**
 * Admin: list all verification requests with optional status filter.
 */
export async function listVerificationRequests(
  statusFilter?: string
): Promise<PopulatedVerificationRequest[]> {
  let query = supabaseAdmin
    .from('verification_requests')
    .select('*, artisan_profiles(id, business_name, user_id)')
    .order('submitted_at', { ascending: true });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to list verification requests: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as Array<
    VerificationRequest & {
      artisan_profiles: { id: string; business_name: string | null; user_id: string } | null;
    }
  >;

  // Batch-fetch artisan user profiles
  const userIds = rows
    .map((r) => r.artisan_profiles?.user_id)
    .filter((id): id is string => Boolean(id));

  const profileMap = new Map<string, { first_name: string; last_name: string }>();
  if (userIds.length > 0) {
    const { data: profs } = await supabaseAdmin
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', userIds);
    for (const p of (profs ?? []) as Array<{
      user_id: string;
      first_name: string;
      last_name: string;
    }>) {
      profileMap.set(p.user_id, { first_name: p.first_name, last_name: p.last_name });
    }
  }

  return rows.map((r) => ({
    id: r.id,
    artisan_id: r.artisan_id,
    document_type: r.document_type,
    document_url: r.document_url,
    status: r.status,
    admin_notes: r.admin_notes,
    submitted_at: r.submitted_at,
    reviewed_at: r.reviewed_at,
    reviewed_by: r.reviewed_by,
    updated_at: r.updated_at,
    artisan: r.artisan_profiles
      ? {
          id: r.artisan_profiles.id,
          business_name: r.artisan_profiles.business_name,
          user_id: r.artisan_profiles.user_id,
          user: r.artisan_profiles.user_id ? profileMap.get(r.artisan_profiles.user_id) ?? null : null,
        }
      : null,
  }));
}

/**
 * Admin: get single verification request with signed document URL.
 */
export async function getVerificationRequest(
  requestId: string
): Promise<PopulatedVerificationRequest> {
  const { data: vr, error } = await supabaseAdmin
    .from('verification_requests')
    .select('*, artisan_profiles(id, business_name, user_id)')
    .eq('id', requestId)
    .single();

  if (error || !vr) {
    throw new ApiError(404, 'NOT_FOUND', 'Verification request not found');
  }

  const row = vr as unknown as VerificationRequest & {
    artisan_profiles: { id: string; business_name: string | null; user_id: string } | null;
  };

  // Generate a 1-hour signed URL for the admin to view the document
  let signed_url: string | undefined;
  try {
    signed_url = await getSignedDocumentUrl(row.document_url, 3600);
  } catch {
    signed_url = undefined;
  }

  let artisanUser: { first_name: string; last_name: string } | null = null;
  if (row.artisan_profiles?.user_id) {
    const { data: prof } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', row.artisan_profiles.user_id)
      .single();
    artisanUser = prof ?? null;
  }

  return {
    id: row.id,
    artisan_id: row.artisan_id,
    document_type: row.document_type,
    document_url: row.document_url,
    status: row.status,
    admin_notes: row.admin_notes,
    submitted_at: row.submitted_at,
    reviewed_at: row.reviewed_at,
    reviewed_by: row.reviewed_by,
    updated_at: row.updated_at,
    signed_url,
    artisan: row.artisan_profiles
      ? {
          id: row.artisan_profiles.id,
          business_name: row.artisan_profiles.business_name,
          user_id: row.artisan_profiles.user_id,
          user: artisanUser,
        }
      : null,
  };
}

/**
 * Admin: approve or reject a verification request.
 * Updating artisan_profiles.verification_status accordingly.
 */
export async function reviewVerificationRequest(
  requestId: string,
  adminUserId: string,
  input: ReviewVerificationInput
): Promise<VerificationRequest> {
  const { data: vr, error: vrErr } = await supabaseAdmin
    .from('verification_requests')
    .select('id, artisan_id, status')
    .eq('id', requestId)
    .single();

  if (vrErr || !vr) {
    throw new ApiError(404, 'NOT_FOUND', 'Verification request not found');
  }

  if (vr.status !== 'pending') {
    throw new ApiError(
      400,
      'ALREADY_REVIEWED',
      `This request has already been ${vr.status}`
    );
  }

  const now = new Date().toISOString();

  const { data: updated, error: updErr } = await supabaseAdmin
    .from('verification_requests')
    .update({
      status: input.status,
      admin_notes: input.admin_notes ?? null,
      reviewed_at: now,
      reviewed_by: adminUserId,
    })
    .eq('id', requestId)
    .select()
    .single();

  if (updErr || !updated) {
    throw new ApiError(500, 'DB_ERROR', `Failed to review request: ${updErr?.message}`);
  }

  // Update artisan profile verification_status to match decision
  await supabaseAdmin
    .from('artisan_profiles')
    .update({ verification_status: input.status })
    .eq('id', vr.artisan_id);

  return updated;
}
