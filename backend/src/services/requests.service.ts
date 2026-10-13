import { supabaseAdmin } from '../config/supabase';
import { ServiceRequest, RequestStatus, UserRole } from '../types/database';
import { ApiError } from '../middleware/errorHandler';
import { CreateRequestInput, UpdateRequestStatusInput } from '../validators/request.validator';

export interface PopulatedServiceRequest extends ServiceRequest {
  service?: {
    id: string;
    name: string;
    pricing_type: string;
  } | null;
  artisan?: {
    id: string;
    business_name: string | null;
    verification_status: string;
    average_rating: number;
    user?: {
      first_name: string;
      last_name: string;
      avatar_url: string | null;
      phone: string | null;
      city: string | null;
      state: string | null;
    } | null;
  };
  customer?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    phone: string | null;
  } | null;
}

/**
 * Customer creates a new service request for an artisan.
 */
export async function createRequest(
  customerId: string,
  input: CreateRequestInput
): Promise<ServiceRequest> {
  // 1. Verify artisan profile exists
  const { data: artisan, error: artErr } = await supabaseAdmin
    .from('artisan_profiles')
    .select('id, user_id')
    .eq('id', input.artisan_id)
    .single();

  if (artErr || !artisan) {
    throw new ApiError(404, 'NOT_FOUND', 'Artisan not found');
  }

  // 2. Prevent self-booking
  if (artisan.user_id === customerId) {
    throw new ApiError(
      400,
      'INVALID_REQUEST',
      'You cannot request services from your own artisan profile'
    );
  }

  // 3. If service_id provided, verify it belongs to this artisan
  if (input.service_id) {
    const { data: srv, error: srvErr } = await supabaseAdmin
      .from('services')
      .select('id')
      .eq('id', input.service_id)
      .eq('artisan_id', input.artisan_id)
      .single();

    if (srvErr || !srv) {
      throw new ApiError(
        400,
        'INVALID_SERVICE',
        'The selected service does not belong to this artisan'
      );
    }
  }

  // 4. Insert service request
  const { data, error } = await supabaseAdmin
    .from('service_requests')
    .insert({
      customer_id: customerId,
      artisan_id: input.artisan_id,
      service_id: input.service_id || null,
      title: input.title,
      description: input.description,
      location: input.location,
      preferred_date: input.preferred_date || null,
      preferred_time: input.preferred_time || null,
      estimated_price: input.estimated_price || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error || !data) {
    throw new ApiError(500, 'DB_ERROR', `Failed to create service request: ${error?.message}`);
  }

  return data;
}

interface RawCustomerRequestRow extends ServiceRequest {
  services: { id: string; name: string; pricing_type: string } | null;
  artisan_profiles: {
    id: string;
    user_id: string;
    business_name: string | null;
    verification_status: string;
    average_rating: number;
  } | null;
}

interface ProfileSummary {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
}

/**
 * Customer lists their own service requests.
 */
export async function getMyCustomerRequests(
  customerId: string,
  statusFilter?: RequestStatus
): Promise<PopulatedServiceRequest[]> {
  let query = supabaseAdmin
    .from('service_requests')
    .select(
      `*,
       services(id, name, pricing_type),
       artisan_profiles(id, user_id, business_name, verification_status, average_rating)`
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to fetch customer requests: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as RawCustomerRequestRow[];
  const artisanUserIds = [
    ...new Set(rows.map((r) => r.artisan_profiles?.user_id).filter((id): id is string => Boolean(id))),
  ];

  // Fetch artisan profiles from profiles table
  const profileMap = new Map<string, ProfileSummary>();
  if (artisanUserIds.length > 0) {
    const { data: profs } = await supabaseAdmin
      .from('profiles')
      .select('user_id, first_name, last_name, avatar_url, phone, city, state')
      .in('user_id', artisanUserIds);

    for (const p of (profs ?? []) as ProfileSummary[]) {
      profileMap.set(p.user_id, p);
    }
  }

  return rows.map((r) => ({
    id: r.id,
    customer_id: r.customer_id,
    artisan_id: r.artisan_id,
    service_id: r.service_id,
    title: r.title,
    description: r.description,
    location: r.location,
    preferred_date: r.preferred_date,
    preferred_time: r.preferred_time,
    status: r.status,
    estimated_price: r.estimated_price,
    created_at: r.created_at,
    updated_at: r.updated_at,
    service: r.services || null,
    artisan: r.artisan_profiles
      ? {
          id: r.artisan_profiles.id,
          business_name: r.artisan_profiles.business_name,
          verification_status: r.artisan_profiles.verification_status,
          average_rating: r.artisan_profiles.average_rating,
          user: profileMap.get(r.artisan_profiles.user_id) || null,
        }
      : undefined,
  }));
}

/**
 * Artisan lists requests assigned to them.
 */
export async function getMyArtisanRequests(
  artisanUserId: string,
  statusFilter?: RequestStatus
): Promise<PopulatedServiceRequest[]> {
  // Resolve artisan profile id
  const { data: ap, error: apErr } = await supabaseAdmin
    .from('artisan_profiles')
    .select('id')
    .eq('user_id', artisanUserId)
    .single();

  if (apErr || !ap) {
    throw new ApiError(404, 'ARTISAN_PROFILE_NOT_FOUND', 'Artisan profile not found');
  }

  let query = supabaseAdmin
    .from('service_requests')
    .select(
      `*,
       services(id, name, pricing_type)`
    )
    .eq('artisan_id', ap.id)
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, 'DB_ERROR', `Failed to fetch artisan requests: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as Array<
    ServiceRequest & { services: { id: string; name: string; pricing_type: string } | null }
  >;
  const customerIds = [
    ...new Set(rows.map((r) => r.customer_id).filter((id): id is string => Boolean(id))),
  ];

  // Fetch customer details from profiles
  const profileMap = new Map<string, ProfileSummary>();
  if (customerIds.length > 0) {
    const { data: profs } = await supabaseAdmin
      .from('profiles')
      .select('user_id, first_name, last_name, avatar_url, phone')
      .in('user_id', customerIds);

    for (const p of (profs ?? []) as ProfileSummary[]) {
      profileMap.set(p.user_id, p);
    }
  }

  return rows.map((r) => ({
    id: r.id,
    customer_id: r.customer_id,
    artisan_id: r.artisan_id,
    service_id: r.service_id,
    title: r.title,
    description: r.description,
    location: r.location,
    preferred_date: r.preferred_date,
    preferred_time: r.preferred_time,
    status: r.status,
    estimated_price: r.estimated_price,
    created_at: r.created_at,
    updated_at: r.updated_at,
    service: r.services || null,
    customer: profileMap.get(r.customer_id) || null,
  }));
}

/**
 * Get single service request by ID with full authorization check.
 */
export async function getRequestById(
  requestId: string,
  userId: string,
  userRole: UserRole
): Promise<PopulatedServiceRequest> {
  const { data: r, error } = await supabaseAdmin
    .from('service_requests')
    .select(
      `*,
       services(id, name, pricing_type),
       artisan_profiles(id, user_id, business_name, verification_status, average_rating)`
    )
    .eq('id', requestId)
    .single();

  if (error || !r) {
    throw new ApiError(404, 'NOT_FOUND', 'Service request not found');
  }

  const isCustomer = r.customer_id === userId;
  const isArtisan = r.artisan_profiles?.user_id === userId;
  const isAdmin = userRole === 'admin';

  if (!isCustomer && !isArtisan && !isAdmin) {
    throw new ApiError(403, 'FORBIDDEN', 'You are not authorized to view this service request');
  }

  // Fetch customer profile
  const { data: custProf } = await supabaseAdmin
    .from('profiles')
    .select('first_name, last_name, avatar_url, phone')
    .eq('user_id', r.customer_id)
    .single();

  // Fetch artisan user profile
  let artisanUser = null;
  if (r.artisan_profiles?.user_id) {
    const { data: artProf } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, avatar_url, phone, city, state')
      .eq('user_id', r.artisan_profiles.user_id)
      .single();
    artisanUser = artProf;
  }

  return {
    id: r.id,
    customer_id: r.customer_id,
    artisan_id: r.artisan_id,
    service_id: r.service_id,
    title: r.title,
    description: r.description,
    location: r.location,
    preferred_date: r.preferred_date,
    preferred_time: r.preferred_time,
    status: r.status,
    estimated_price: r.estimated_price,
    created_at: r.created_at,
    updated_at: r.updated_at,
    service: r.services || null,
    artisan: r.artisan_profiles
      ? {
          id: r.artisan_profiles.id,
          business_name: r.artisan_profiles.business_name,
          verification_status: r.artisan_profiles.verification_status,
          average_rating: r.artisan_profiles.average_rating,
          user: artisanUser,
        }
      : undefined,
    customer: custProf || null,
  };
}

/**
 * Update service request status following strict state machine rules.
 */
export async function updateRequestStatus(
  requestId: string,
  userId: string,
  userRole: UserRole,
  input: UpdateRequestStatusInput
): Promise<ServiceRequest> {
  // Fetch current request + artisan profile
  const { data: r, error: rErr } = await supabaseAdmin
    .from('service_requests')
    .select('*, artisan_profiles(id, user_id, completed_jobs)')
    .eq('id', requestId)
    .single();

  if (rErr || !r) {
    throw new ApiError(404, 'NOT_FOUND', 'Service request not found');
  }

  const isCustomer = r.customer_id === userId;
  const isArtisan = r.artisan_profiles?.user_id === userId;
  const isAdmin = userRole === 'admin';
  const currentStatus = r.status as RequestStatus;
  const newStatus = input.status;

  if (currentStatus === newStatus) {
    return r;
  }

  // Terminal states cannot be changed
  if (
    currentStatus === 'completed' ||
    currentStatus === 'cancelled' ||
    currentStatus === 'rejected'
  ) {
    throw new ApiError(
      400,
      'INVALID_STATUS_TRANSITION',
      `Cannot change status of a ${currentStatus} request`
    );
  }

  // Authorization and State Machine validation
  if (isAdmin) {
    // Admin can transition any state if required
  } else if (isCustomer) {
    // Customers can ONLY cancel pending or accepted requests
    if (newStatus !== 'cancelled') {
      throw new ApiError(403, 'FORBIDDEN', 'Customers can only cancel requests');
    }
    if (currentStatus !== 'pending' && currentStatus !== 'accepted') {
      throw new ApiError(
        400,
        'INVALID_STATUS_TRANSITION',
        'You can only cancel pending or accepted requests'
      );
    }
  } else if (isArtisan) {
    // Artisan state transitions:
    // pending -> accepted | rejected
    // accepted -> in_progress
    // in_progress -> completed
    const allowedTransitions: Record<RequestStatus, RequestStatus[]> = {
      pending: ['accepted', 'rejected'],
      accepted: ['in_progress'],
      in_progress: ['completed'],
      completed: [],
      rejected: [],
      cancelled: [],
    };

    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new ApiError(
        400,
        'INVALID_STATUS_TRANSITION',
        `Cannot transition request from "${currentStatus}" to "${newStatus}"`
      );
    }
  } else {
    throw new ApiError(403, 'FORBIDDEN', 'You are not authorized to update this request');
  }

  const updates: Partial<ServiceRequest> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (input.estimated_price !== undefined) {
    updates.estimated_price = input.estimated_price;
  }

  const { data: updated, error: updErr } = await supabaseAdmin
    .from('service_requests')
    .update(updates)
    .eq('id', requestId)
    .select()
    .single();

  if (updErr || !updated) {
    throw new ApiError(500, 'DB_ERROR', `Failed to update request: ${updErr?.message}`);
  }

  // If transitioned to completed, increment completed_jobs counter on artisan profile
  if (newStatus === 'completed' && r.artisan_profiles) {
    const nextCount = (r.artisan_profiles.completed_jobs ?? 0) + 1;
    await supabaseAdmin
      .from('artisan_profiles')
      .update({ completed_jobs: nextCount })
      .eq('id', r.artisan_profiles.id);
  }

  return updated;
}
