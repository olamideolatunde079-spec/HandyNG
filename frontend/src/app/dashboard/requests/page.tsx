'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthToken } from '@/hooks/useAuthToken';
import {
  fetchMyRequests,
  updateServiceRequestStatus,
  PopulatedServiceRequest,
} from '@/services/requests';
import { RequestStatus } from '@/types/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faClipboardList,
  faCalendarAlt,
  faClock,
  faLocationDot,
  faShieldHalved,
  faStar,
  faBan,
  faPhone,
  faCheckCircle,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';
import Alert from '@/components/ui/Alert';

const STATUS_TABS: Array<{ label: string; value: RequestStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const STATUS_BADGES: Record<
  RequestStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  accepted: {
    label: 'Accepted',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  rejected: {
    label: 'Declined',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
};

export default function CustomerRequestsPage() {
  const { initialized } = useRequireAuth('customer');
  const { profile } = useAuth();
  const token = useAuthToken();

  const [requests, setRequests] = useState<PopulatedServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RequestStatus | 'all'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!token) return;

      const filter = activeTab === 'all' ? undefined : activeTab;
      const data = await fetchMyRequests(token, filter);
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your service requests');
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    if (initialized) {
      loadRequests();
    }
  }, [initialized, loadRequests]);

  async function handleCancelRequest(requestId: string) {
    if (!confirm('Are you sure you want to cancel this service request?')) {
      return;
    }

    try {
      setCancellingId(requestId);
      setError(null);
      if (!token) throw new Error('Not authenticated');

      await updateServiceRequestStatus(token, requestId, { status: 'cancelled' });
      setSuccessMsg('Request successfully cancelled');
      await loadRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel service request');
    } finally {
      setCancellingId(null);
    }
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <Link href="/" className="text-xl font-bold text-emerald-600">
            HandyNG
          </Link>
          <Link
            href="/artisans"
            className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
          >
            Find Artisans
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Page Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">My Service Requests</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage all services you requested from artisans.
            </p>
          </div>
          <Link
            href="/artisans"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            New Request
          </Link>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {successMsg && (
          <div className="mb-6">
            <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex overflow-x-auto border-b border-gray-200 pb-px gap-2">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition border-b-2 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="py-20 text-center">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <p className="mt-3 text-sm text-gray-400">Loading your requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <FontAwesomeIcon
              icon={faClipboardList}
              className="mx-auto h-12 w-12 text-gray-300 mb-3"
            />
            <h2 className="text-base font-semibold text-gray-900">No service requests found</h2>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              {activeTab === 'all'
                ? "You haven't requested any services yet. Find trusted artisans in your area."
                : `You don't have any requests in "${activeTab}" status.`}
            </p>
            <div className="mt-6">
              <Link
                href="/artisans"
                className="inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                Browse Artisans
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {requests.map((r) => {
              const badge = STATUS_BADGES[r.status] || STATUS_BADGES.pending;
              const artisanName =
                r.artisan?.business_name ??
                `${r.artisan?.user?.first_name ?? ''} ${r.artisan?.user?.last_name ?? ''}`.trim() ??
                'Artisan';
              const canCancel = r.status === 'pending' || r.status === 'accepted';
              const isAccepted = r.status === 'accepted' || r.status === 'in_progress';

              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col gap-4 hover:border-gray-200 transition"
                >
                  {/* Top row: Title + Status */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                        {r.service && (
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {r.service.name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(r.created_at).toLocaleDateString('en-NG', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-gray-900">{r.title}</h2>
                    </div>

                    {r.estimated_price != null && (
                      <div className="text-right">
                        <span className="text-xs text-gray-400">Budget / Price</span>
                        <p className="text-base font-bold text-gray-900">
                          ₦{Number(r.estimated_price).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {r.description}
                  </p>

                  {/* Metadata info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5 text-gray-400" />
                      {r.location}
                    </span>
                    {r.preferred_date && (
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="h-3.5 w-3.5 text-gray-400"
                        />
                        {new Date(r.preferred_date).toLocaleDateString('en-NG', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {r.preferred_time && (
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5 text-gray-400" />
                        {r.preferred_time.slice(0, 5)}
                      </span>
                    )}
                  </div>

                  {/* Artisan Card & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100">
                    {/* Artisan info */}
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center shrink-0">
                        {r.artisan?.user?.avatar_url ? (
                          <Image
                            src={r.artisan.user.avatar_url}
                            alt={artisanName}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs">
                            {artisanName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/artisans/${r.artisan_id}`}
                            className="text-xs font-semibold text-gray-900 hover:text-emerald-600 transition"
                          >
                            {artisanName}
                          </Link>
                          {r.artisan?.verification_status === 'verified' && (
                            <FontAwesomeIcon
                              icon={faShieldHalved}
                              className="h-3 w-3 text-emerald-600"
                            />
                          )}
                        </div>
                        {isAccepted && r.artisan?.user?.phone && (
                          <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                            <FontAwesomeIcon icon={faPhone} className="h-2.5 w-2.5" />
                            {r.artisan.user.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {canCancel && (
                        <button
                          onClick={() => handleCancelRequest(r.id)}
                          disabled={cancellingId === r.id}
                          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition"
                        >
                          <FontAwesomeIcon icon={faBan} className="mr-1.5 h-3 w-3" />
                          {cancellingId === r.id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      )}

                      {r.status === 'completed' && (
                        <>
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="h-3.5 w-3.5 text-emerald-600"
                            />
                            Service Completed
                          </span>
                          <Link
                            href="/dashboard/reviews"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
                            Leave a Review
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
