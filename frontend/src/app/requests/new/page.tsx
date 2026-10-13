'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthToken } from '@/hooks/useAuthToken';
import { fetchArtisanProfile, ArtisanFullProfile } from '@/services/artisans';
import { createServiceRequest } from '@/services/requests';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faShieldHalved,
  faStar,
  faLocationDot,
  faCalendarAlt,
  faClock,
  faNairaSign,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import Alert from '@/components/ui/Alert';

function RequestFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const artisanId = searchParams.get('artisan_id');
  const preselectedServiceId = searchParams.get('service_id');

  const { initialized } = useRequireAuth('customer');
  const { profile, session } = useAuth();

  const [artisanData, setArtisanData] = useState<ArtisanFullProfile | null>(null);
  const [loadingArtisan, setLoadingArtisan] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [serviceId, setServiceId] = useState<string>(preselectedServiceId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<string>('');

  // Pre-fill location from customer profile once loaded
  useEffect(() => {
    if (profile) {
      const locParts = [profile.city, profile.state].filter(Boolean);
      if (locParts.length > 0 && !location) {
        setLocation(locParts.join(', '));
      }
    }
  }, [profile, location]);

  // Load artisan profile
  useEffect(() => {
    if (!artisanId) {
      setLoadingArtisan(false);
      return;
    }
    fetchArtisanProfile(artisanId)
      .then((data) => {
        setArtisanData(data);
        if (preselectedServiceId) {
          const s = data.services.find((srv) => srv.id === preselectedServiceId);
          if (s) {
            setTitle(`Request for ${s.name}`);
            if (s.price_from) {
              setEstimatedPrice(String(s.price_from));
            }
          }
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load artisan information');
      })
      .finally(() => setLoadingArtisan(false));
  }, [artisanId, preselectedServiceId]);

  function handleServiceChange(selectedId: string) {
    setServiceId(selectedId);
    if (artisanData && selectedId) {
      const s = artisanData.services.find((srv) => srv.id === selectedId);
      if (s) {
        setTitle(`Request for ${s.name}`);
        if (s.price_from) {
          setEstimatedPrice(String(s.price_from));
        }
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!artisanId) {
      setError('No artisan selected');
      return;
    }
    if (!title.trim() || !description.trim() || !location.trim()) {
      setError('Please fill in all required fields (title, description, location)');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = session?.access_token;
      if (!token) throw new Error('You must be logged in to send a request');

      await createServiceRequest(token, {
        artisan_id: artisanId,
        service_id: serviceId || null,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        preferred_date: preferredDate || null,
        preferred_time: preferredTime || null,
        estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : null,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/requests');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit service request');
      setSubmitting(false);
    }
  }

  if (!initialized || loadingArtisan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!artisanId || !artisanData) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Artisan Not Found</h1>
          <p className="text-sm text-gray-500 mb-6">
            Please choose an artisan from the marketplace to request a service.
          </p>
          <Link
            href="/artisans"
            className="inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Browse Artisans
          </Link>
        </div>
      </div>
    );
  }

  const { artisan, profile: artisanProf, services } = artisanData;
  const displayName =
    artisan.business_name ?? `${artisanProf.first_name} ${artisanProf.last_name}`.trim();
  const artisanLoc = [artisanProf.city, artisanProf.state].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            href={`/artisans/${artisanId}`}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            <span className="hidden sm:inline">Back to artisan profile</span>
          </Link>
          <Link href="/" className="text-xl font-bold text-emerald-600">
            HandyNG
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Intro */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Request a Service</h1>
          <p className="mt-1 text-sm text-gray-500">
            Find. Trust. Get It Done — Send your service details to get started.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
            <FontAwesomeIcon icon={faCheckCircle} className="h-10 w-10 text-emerald-600 mb-2" />
            <h2 className="text-lg font-bold text-emerald-900">Request Sent!</h2>
            <p className="text-sm text-emerald-700 mt-1">
              Your service request was sent to {displayName}. Redirecting to your requests...
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col gap-6"
          >
            {/* Service selector */}
            {services.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Select Service (Optional)
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
                >
                  <option value="">General Custom Request / Inquiry</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.pricing_type.replace('_', ' ')})
                      {s.price_from ? ` — from ₦${Number(s.price_from).toLocaleString()}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Request Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Repair bathroom tap leak & pipe replacement"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Problem Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what needs to be fixed or done, materials needed if known, etc."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>

            {/* Location / Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Service Location / Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3.5 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
                />
              </div>
            </div>

            {/* Preferred Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Preferred Date
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3.5 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Preferred Time
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  />
                  <input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3.5 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>
              </div>
            </div>

            {/* Estimated / Budget Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Proposed Budget / Estimated Price (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                  ₦
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  placeholder="Optional budget or initial offer"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-3.5 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || success}
              className="mt-2 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Submitting Request...' : 'Send Service Request'}
            </button>
          </form>

          {/* Artisan Summary Card */}
          <aside>
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Artisan Summary
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center shrink-0">
                  {artisanProf.avatar_url ? (
                    <Image
                      src={artisanProf.avatar_url}
                      alt={displayName}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-emerald-700 font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                  {artisan.verification_status === 'verified' && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-amber-400" />
                  {Number(artisan.average_rating).toFixed(1)}
                </span>
                <span>•</span>
                <span>{artisan.total_reviews} reviews</span>
                <span>•</span>
                <span>{artisan.completed_jobs} jobs</span>
              </div>

              {artisanLoc && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3 text-gray-400" />
                  {artisanLoc}
                </p>
              )}

              <div className="bg-slate-50 rounded-xl p-3 text-xs text-gray-500 leading-relaxed border border-gray-100">
                <strong>How it works:</strong>
                <ol className="list-decimal pl-4 mt-1.5 space-y-1">
                  <li>You submit your job details.</li>
                  <li>The artisan reviews and accepts or declines.</li>
                  <li>Once accepted, the artisan begins work.</li>
                  <li>Payment is arranged safely upon satisfaction.</li>
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <RequestFormContent />
    </Suspense>
  );
}
