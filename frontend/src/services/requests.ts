import { api } from '@/lib/api';
import { ServiceRequest, RequestStatus } from '@/types/database';

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

export interface CreateRequestPayload {
  artisan_id: string;
  service_id?: string | null;
  title: string;
  description: string;
  location: string;
  preferred_date?: string | null;
  preferred_time?: string | null;
  estimated_price?: number | null;
}

export interface UpdateRequestStatusPayload {
  status: RequestStatus;
  estimated_price?: number | null;
}

/**
 * Fetch requests for current user (customer requests or artisan incoming requests).
 */
export async function fetchMyRequests(
  token: string,
  status?: RequestStatus
): Promise<PopulatedServiceRequest[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await api.get<PopulatedServiceRequest[]>(`/api/v1/requests${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Fetch a single request by ID.
 */
export async function fetchRequestById(
  token: string,
  id: string
): Promise<PopulatedServiceRequest> {
  const res = await api.get<PopulatedServiceRequest>(`/api/v1/requests/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Create a new service request (customer only).
 */
export async function createServiceRequest(
  token: string,
  payload: CreateRequestPayload
): Promise<ServiceRequest> {
  const res = await api.post<ServiceRequest>('/api/v1/requests', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Update the status of a service request.
 */
export async function updateServiceRequestStatus(
  token: string,
  id: string,
  payload: UpdateRequestStatusPayload
): Promise<ServiceRequest> {
  const res = await api.patch<ServiceRequest>(`/api/v1/requests/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
