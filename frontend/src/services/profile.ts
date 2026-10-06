import { api } from '@/lib/api';
import { Profile, ArtisanProfile } from '@/types/database';

// ── Customer profile ───────────────────────────────────────────

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
}

export async function fetchMyProfile(token: string): Promise<Profile> {
  const res = await api.get<Profile>('/api/v1/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateMyProfile(
  token: string,
  payload: UpdateProfilePayload
): Promise<Profile> {
  const res = await api.patch<Profile>('/api/v1/users/me', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ── Artisan profile ────────────────────────────────────────────

export interface UpdateArtisanPayload {
  business_name?: string | null;
  bio?: string | null;
  years_experience?: number | null;
  service_radius?: number | null;
}

export async function fetchMyArtisanProfile(token: string): Promise<ArtisanProfile> {
  const res = await api.get<ArtisanProfile>('/api/v1/artisans/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateMyArtisanProfile(
  token: string,
  payload: UpdateArtisanPayload
): Promise<ArtisanProfile> {
  const res = await api.patch<ArtisanProfile>('/api/v1/artisans/me', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ── Avatar upload ──────────────────────────────────────────────

export async function uploadAvatar(token: string, file: File): Promise<{ avatar_url: string }> {
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
  const form = new FormData();
  form.append('avatar', file);

  const res = await fetch(`${apiUrl}/api/v1/upload/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const json = (await res.json()) as {
    success: boolean;
    data?: { avatar_url: string };
    error?: { message: string };
  };

  if (!json.success || !json.data) {
    throw new Error(json.error?.message ?? 'Upload failed');
  }

  return json.data;
}
