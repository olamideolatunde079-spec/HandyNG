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
  faCheck,
  faXmark,
  faPlay,
  faCheckCircle,
  faPhone,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Alert } from '@/components/ui/Alert';

const STATUS_TABS: Array<{ label: string; value: RequestStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Declined / Cancelled', value: 'rejected' },
];

const STATUS_BADGES: Record<
  RequestStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: 'Needs Response',
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
    label: 'Cancelled by Customer',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
};

export default function ArtisanRequestsPage() {
  const { initialized } = useRequireAuth('artisan');
  const { profile } = useAuth();
  const { getToken } = useAuthToken();

  const [requests, setRequests] = useState<PopulatedServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RequestStatus | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) return;

      const filter = activeTab === 'all' ? undefined : activeTab;
      const data = await fetchMyRequests(token, filter);
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load incoming service requests');
    } finally {
      setLoading(false);
    }
  }, [getToken, activeTab]);

  useEffect(() => {
    if (initialized) {
      loadRequests();
    }
  }, [initialized, loadRequests]);

  async function handleStatusChange(requestId: string, newStatus: RequestStatus) {
    try {
      setUpdatingId(requestId);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      await updateServiceRequestStatus(token, requestId, { status: newStatus });
      setSuccessMsg(`Request successfully marked as ${newStatus.replace('_', ' ')}`);
      await loadRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to update request status');
    } finally {
      setUpdatingId(null);
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
            href="/artisan/dashboard"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Artisan Dashboard</span>
          </Link>
          <Link href="/" className="text-xl font-bold text-emerald-600">
            HandyNG
          </Link>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Artisan Portal
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Incoming Service Requests
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage client requests, accept jobs, and update progress.
            </p>
          </div>
          <Link
            href="/artisan/services"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Manage Services
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

        {/* List */}
        {loading ? (
          <div className="py-20 text-center">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <p className="mt-3 text-sm text-gray-400">Loading incoming requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <FontAwesomeIcon
              icon={faClipboardList}
              className="mx-auto h-12 w-12 text-gray-300 mb-3"
            />
            <h2 className="text-base font-semibold text-gray-900">No requests found</h2>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              {activeTab === 'all'
                ? 'You have not received any service requests yet. Make sure your services and service areas are up to date!'
                : `No requests with status "${activeTab}".`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {requests.map((r) => {
              const badge = STATUS_BADGES[r.status] || STATUS_BADGES.pending;
              const customerName = r.customer
                ? `${r.customer.first_name} ${r.customer.last_name}`.trim()
                : 'Customer';
              const isPending = r.status === 'pending';
              const isAccepted = r.status === 'accepted';
              const isInProgress = r.status === 'in_progress';
              const isCompleted = r.status === 'completed';

              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col gap-4 hover:border-gray-200 transition"
                >
                  {/* Top row */}
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
                        <span className="text-xs text-gray-400">Estimated Budget</span>
                        <p className="text-base font-bold text-gray-900">
                          ₦{Number(r.estimated_price).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Problem Description */}
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Job Description
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {r.description}
                    </p>
                  </div>

                  {/* Metadata: Location, Date, Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600 py-1">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        className="h-3.5 w-3.5 text-emerald-600 shrink-0"
                      />
                      <span className="truncate">{r.location}</span>
                    </span>
                    {r.preferred_date ? (
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="h-3.5 w-3.5 text-emerald-600 shrink-0"
                        />
                        <span>
                          {new Date(r.preferred_date).toLocaleDateString('en-NG', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-400">Date: Flexible</span>
                    )}
                    {r.preferred_time ? (
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="h-3.5 w-3.5 text-emerald-600 shrink-0"
                        />
                        <span>{r.preferred_time.slice(0, 5)}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">Time: Flexible</span>
                    )}
                  </div>

                  {/* Customer Info & Status Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100">
                    {/* Customer */}
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                        {r.customer?.avatar_url ? (
                          <Image
                            src={r.customer.avatar_url}
                            alt={customerName}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{customerName}</p>
                        {r.customer?.phone && (
                          <a
                            href={`tel:${r.customer.phone}`}
                            className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <FontAwesomeIcon icon={faPhone} className="h-2.5 w-2.5" />
                            {r.customer.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Action buttons following status state machine */}
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleStatusChange(r.id, 'accepted')}
                            disabled={updatingId === r.id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                          >
                            <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                            Accept Request
                          </button>
                          <button
                            onClick={() => handleStatusChange(r.id, 'rejected')}
                            disabled={updatingId === r.id}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition"
                          >
                            <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                            Decline
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <button
                          onClick={() => handleStatusChange(r.id, 'in_progress')}
                          disabled={updatingId === r.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                          <FontAwesomeIcon icon={faPlay} className="h-2.5 w-2.5" />
                          Start Job (In Progress)
                        </button>
                      )}

                      {isInProgress && (
                        <button
                          onClick={() => handleStatusChange(r.id, 'completed')}
                          disabled={updatingId === r.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                        >
                          <FontAwesomeIcon icon={faCheckCircle} className="h-3.5 w-3.5" />
                          Mark Completed
                        </button>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="h-3.5 w-3.5 text-emerald-600"
                          />
                          Job Completed
                        </span>
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
