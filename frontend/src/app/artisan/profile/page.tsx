'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthToken } from '@/hooks/useAuthToken';
import {
  updateMyProfile,
  updateMyArtisanProfile,
  uploadAvatar,
  fetchMyArtisanProfile,
} from '@/services/profile';
import { ArtisanProfile } from '@/types/database';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import AvatarUpload from '@/components/ui/AvatarUpload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShieldHalved, faStar } from '@fortawesome/free-solid-svg-icons';

// ── Verification badge ─────────────────────────────────────────

function VerificationBadge({ status }: { status: ArtisanProfile['verification_status'] }) {
  const styles = {
    verified: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  };
  const labels = { verified: 'Verified', pending: 'Pending verification', rejected: 'Rejected' };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
      {labels[status]}
    </span>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default function ArtisanProfilePage() {
  useRequireAuth('artisan');
  const { profile, refreshProfile } = useAuth();
  const token = useAuthToken();

  const [artisan, setArtisan] = useState<ArtisanProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [base, setBase] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    state: '',
  });
  const [biz, setBiz] = useState({
    business_name: '',
    bio: '',
    years_experience: '',
    service_radius: '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load artisan profile
  useEffect(() => {
    if (!token) return;
    fetchMyArtisanProfile(token)
      .then((ap) => {
        setArtisan(ap);
        setBiz({
          business_name: ap.business_name ?? '',
          bio: ap.bio ?? '',
          years_experience: ap.years_experience?.toString() ?? '',
          service_radius: ap.service_radius?.toString() ?? '',
        });
      })
      .catch(() => {
        /* artisan profile might not exist yet */
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Prefill base profile
  useEffect(() => {
    if (!profile) return;
    setBase({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      phone: profile.phone ?? '',
      city: profile.city ?? '',
      state: profile.state ?? '',
    });
  }, [profile]);

  function setB(key: keyof typeof base) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setBase((prev) => ({ ...prev, [key]: e.target.value }));
  }
  function setA(key: keyof typeof biz) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setBiz((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      // Update base profile (name, phone, location)
      await updateMyProfile(token, {
        first_name: base.first_name || undefined,
        last_name: base.last_name || undefined,
        phone: base.phone || null,
        city: base.city || null,
        state: base.state || null,
      });

      // Update artisan-specific fields
      await updateMyArtisanProfile(token, {
        business_name: biz.business_name || null,
        bio: biz.bio || null,
        years_experience: biz.years_experience ? parseInt(biz.years_experience, 10) : null,
        service_radius: biz.service_radius ? parseInt(biz.service_radius, 10) : null,
      });

      await refreshProfile();

      // Refresh artisan profile
      const updated = await fetchMyArtisanProfile(token);
      setArtisan(updated);

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

  if (loading || !profile) {
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
          <Link href="/artisan/dashboard" className="text-gray-500 hover:text-gray-700 transition">
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Edit profile</h1>
          {artisan && (
            <div className="ml-auto">
              <VerificationBadge status={artisan.verification_status} />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 flex flex-col gap-6">
        {/* Avatar + rating overview */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100 bg-gray-50 px-6 py-8">
            <AvatarUpload
              currentUrl={profile.avatar_url}
              name={`${profile.first_name} ${profile.last_name}`}
              onUpload={handleAvatarUpload}
              size={96}
            />
            {artisan && (
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {artisan.business_name || `${profile.first_name} ${profile.last_name}`}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-amber-400" />
                    {Number(artisan.average_rating).toFixed(1)} ({artisan.total_reviews} reviews)
                  </span>
                  <span>·</span>
                  <span>{artisan.completed_jobs} jobs</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate className="px-6 py-8 flex flex-col gap-6">
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="error">{error}</Alert>}

            {/* Personal info */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Personal information</h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First name"
                    type="text"
                    required
                    value={base.first_name}
                    onChange={setB('first_name')}
                  />
                  <Input
                    label="Last name"
                    type="text"
                    required
                    value={base.last_name}
                    onChange={setB('last_name')}
                  />
                </div>
                <Input
                  label="Phone number"
                  type="tel"
                  value={base.phone}
                  onChange={setB('phone')}
                  hint="Optional"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="City" type="text" value={base.city} onChange={setB('city')} />
                  <Input label="State" type="text" value={base.state} onChange={setB('state')} />
                </div>
              </div>
            </div>

            {/* Business info */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Business information</h2>
              <div className="flex flex-col gap-4">
                <Input
                  label="Business / trading name"
                  type="text"
                  value={biz.business_name}
                  onChange={setA('business_name')}
                  hint="Leave blank to use your full name"
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bio" className="text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    maxLength={1000}
                    value={biz.bio}
                    onChange={setA('bio')}
                    placeholder="Describe your experience, skills and what makes you stand out…"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm
                               text-gray-900 placeholder-gray-400 focus:border-emerald-400
                               focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right">{biz.bio.length}/1000</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Years of experience"
                    type="number"
                    min="0"
                    max="80"
                    value={biz.years_experience}
                    onChange={setA('years_experience')}
                    hint="e.g. 7"
                  />
                  <Input
                    label="Service radius (km)"
                    type="number"
                    min="1"
                    max="500"
                    value={biz.service_radius}
                    onChange={setA('service_radius')}
                    hint="How far you're willing to travel"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <Link
                href="/artisan/dashboard"
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

        {/* Verification link */}
        {artisan && artisan.verification_status !== 'verified' && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-6 py-5">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="h-5 w-5 text-amber-600 mt-0.5 shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-amber-800">Get verified</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Verified artisans get more visibility and customer trust. Submit your ID to start
                  the verification process.
                </p>
                <Link
                  href="/artisan/verification"
                  className="mt-3 inline-block text-xs font-semibold text-amber-700 underline hover:text-amber-800"
                >
                  Submit verification documents →
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
