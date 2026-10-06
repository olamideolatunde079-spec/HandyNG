'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthToken } from '@/hooks/useAuthToken';
import { updateMyProfile, uploadAvatar } from '@/services/profile';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import AvatarUpload from '@/components/ui/AvatarUpload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface FormState {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  state: string;
  address: string;
}

export default function CustomerProfilePage() {
  useRequireAuth('customer');
  const { profile, refreshProfile } = useAuth();
  const token = useAuthToken();

  const [form, setForm] = useState<FormState>({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    state: '',
    address: '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Prefill from profile once loaded
  useEffect(() => {
    if (!profile) return;
    setForm({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      phone: profile.phone ?? '',
      city: profile.city ?? '',
      state: profile.state ?? '',
      address: '',
    });
  }, [profile]);

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await updateMyProfile(token, {
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
        phone: form.phone || null,
        city: form.city || null,
        state: form.state || null,
        address: form.address || null,
      });
      await refreshProfile();
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    if (!token) return;
    await uploadAvatar(token, file);
    await refreshProfile();
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition">
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Edit profile</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Avatar section */}
          <div className="flex flex-col items-center gap-2 border-b border-gray-100 bg-gray-50 px-6 py-8">
            <AvatarUpload
              currentUrl={profile.avatar_url}
              name={`${profile.first_name} ${profile.last_name}`}
              onUpload={handleAvatarUpload}
              size={96}
            />
          </div>

          {/* Form section */}
          <form onSubmit={handleSubmit} noValidate className="px-6 py-8 flex flex-col gap-5">
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="error">{error}</Alert>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First name"
                type="text"
                autoComplete="given-name"
                required
                value={form.first_name}
                onChange={set('first_name')}
              />
              <Input
                label="Last name"
                type="text"
                autoComplete="family-name"
                required
                value={form.last_name}
                onChange={set('last_name')}
              />
            </div>

            <Input
              label="Phone number"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={set('phone')}
              hint="Optional — e.g. +234 801 234 5678"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="City" type="text" value={form.city} onChange={set('city')} />
              <Input label="State" type="text" value={form.state} onChange={set('state')} />
            </div>

            <Input
              label="Address"
              type="text"
              autoComplete="street-address"
              value={form.address}
              onChange={set('address')}
              hint="Optional"
            />

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/dashboard"
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Cancel
              </Link>
              <Button type="submit" loading={saving} disabled={!token}>
                Save changes
              </Button>
            </div>
          </form>
        </div>

        {/* Account info */}
        <div className="mt-6 rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Account information</h2>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className="font-medium capitalize">{profile.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account ID</span>
              <span className="font-mono text-xs text-gray-400">
                {profile.user_id.slice(0, 8)}…
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
