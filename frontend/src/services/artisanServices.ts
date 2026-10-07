import { api, ApiRequestError } from '@/lib/api';
import { Service } from '@/types/database';

const BASE = '/api/v1/services';

export interface CreateServicePayload {
  category_id: string;
  name: string;
  description?: string | null;
  price_from?: number | null;
  price_to?: number | null;
  pricing_type: 'fixed' | 'starting_from' | 'negotiable' | 'inspection_required';
  is_active?: boolean;
}

export type UpdateServicePayload = Partial<Omit<CreateServicePayload, 'category_id'>>;

export async function fetchMyServices(token: string): Promise<Service[]> {
  const res = await api.get<Service[]>(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function createService(
  token: string,
  payload: CreateServicePayload
): Promise<Service> {
  const res = await api.post<Service>(BASE, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateService(
  token: string,
  id: string,
  payload: UpdateServicePayload
): Promise<Service> {
  const res = await api.patch<Service>(`${BASE}/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function deleteService(token: string, id: string): Promise<void> {
  try {
    await api.delete<null>(`${BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    if (err instanceof ApiRequestError) throw err;
    throw err;
  }
}
