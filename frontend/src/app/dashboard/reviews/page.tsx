'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuthToken } from '@/hooks/useAuthToken';
import { fetchMyRequests, PopulatedServiceRequest } from '@/services/requests';
import { submitReview, fetchMyReviews, PopulatedReview } from '@/services/reviews';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faStar,
  faCheckCircle,
  faUser,
  faPenToSquare,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import Alert from '@/components/ui/Alert';

/* ─────────────────────────────────────────────────────── */
/*  Star picker                                            */
/* ─────────────────────────────────────────────────────── */
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" aria-label="Rating picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className="h-8 w-8 transition-transform hover:scale-110 focus:outline-none"
        >
          <FontAwesomeIcon
            icon={faStar}
            className={`h-7 w-7 transition-colors ${
              n <= (hover || value) ? 'text-amber-400' : 'text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  Review modal / inline form                             */
/* ─────────────────────────────────────────────────────── */
interface ReviewFormProps {
  request: PopulatedServiceRequest;
  token: string;
  onDone: () => void;
  onClose: () => void;
}

function ReviewForm({ request, token, onDone, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const artisanName =
    request.artisan?.user
      ? `${request.artisan.user.first_name} ${request.artisan.user.last_name}`.trim()
      : request.artisan?.business_name ?? 'Artisan';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitReview(token, {
        service_request_id: request.id,
        rating,
        comment: comment.trim() || null,
      });
      onDone();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg ?? 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          aria-label="Close review form"
        >
          <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-1">Leave a Review</h2>
        <p className="text-sm text-gray-500 mb-5">
          How was your experience with{' '}
          <span className="font-semibold text-gray-700">{artisanName}</span> for{' '}
          <span className="font-semibold text-gray-700">&ldquo;{request.title}&rdquo;</span>?
        </p>

        {error && <Alert type="error" message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Stars */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="review-comment"
              className="text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              Comment <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              placeholder="Describe your experience…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none transition"
            />
            <p className="text-xs text-gray-400 text-right">{comment.length}/2000</p>
          </div>

          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  Main page                                             */
/* ─────────────────────────────────────────────────────── */
export default function CustomerReviewsPage() {
  useRequireAuth();
  const token = useAuthToken();

  const [completedRequests, setCompletedRequests] = useState<PopulatedServiceRequest[]>([]);
  const [myReviews, setMyReviews] = useState<PopulatedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeForm, setActiveForm] = useState<PopulatedServiceRequest | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [reqs, reviews] = await Promise.all([
        fetchMyRequests(token, 'completed'),
        fetchMyReviews(token),
      ]);
      setCompletedRequests(reqs);
      setMyReviews(reviews);
    } catch {
      setError('Failed to load your reviews. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  // Determine which completed requests don't have a review yet
  const reviewedRequestIds = new Set(myReviews.map((r) => r.service_request_id));
  const pendingReviews = completedRequests.filter((r) => !reviewedRequestIds.has(r.id));

  function handleReviewDone(requestId: string) {
    setActiveForm(null);
    setSuccessId(requestId);
    void load();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Review modal */}
      {activeForm && (
        <ReviewForm
          request={activeForm}
          token={token!}
          onDone={() => handleReviewDone(activeForm.id)}
          onClose={() => setActiveForm(null)}
        />
      )}

      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-sm font-semibold text-gray-900">My Reviews</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
        {error && <Alert variant="error">{error}</Alert>}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* ── Pending reviews ── */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4 text-emerald-500" />
                Completed jobs awaiting review
                {pendingReviews.length > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                    {pendingReviews.length}
                  </span>
                )}
              </h2>

              {pendingReviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-8 w-8 text-emerald-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">
                    All completed jobs have been reviewed — great job!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingReviews.map((r) => {
                    const artisanName =
                      r.artisan?.user
                        ? `${r.artisan.user.first_name} ${r.artisan.user.last_name}`.trim()
                        : r.artisan?.business_name ?? 'Artisan';
                    const avatarUrl = r.artisan?.user?.avatar_url ?? null;
                    const isJustReviewed = successId === r.id;

                    return (
                      <div
                        key={r.id}
                        className={`rounded-2xl bg-white border shadow-sm p-4 flex items-start gap-4 transition ${
                          isJustReviewed ? 'border-emerald-300 bg-emerald-50' : 'border-gray-100'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative h-11 w-11 shrink-0 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center">
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt={artisanName}
                              width={44}
                              height={44}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{artisanName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Completed{' '}
                            {new Date(r.updated_at).toLocaleDateString('en-NG', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>

                        {isJustReviewed ? (
                          <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-lg px-3 py-1.5">
                            <FontAwesomeIcon icon={faCheckCircle} className="h-3.5 w-3.5" />
                            Reviewed
                          </span>
                        ) : (
                          <button
                            onClick={() => setActiveForm(r)}
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                          >
                            <FontAwesomeIcon icon={faStar} className="h-3 w-3" />
                            Review
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Past reviews ── */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faStar} className="h-4 w-4 text-amber-400" />
                Reviews you&apos;ve left ({myReviews.length})
              </h2>

              {myReviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center">
                  <FontAwesomeIcon icon={faStar} className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No reviews yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {myReviews.map((rv) => (
                    <div
                      key={rv.id}
                      className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5"
                    >
                      {/* Star display */}
                      <div className="flex items-center gap-1.5 mb-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <FontAwesomeIcon
                            key={n}
                            icon={faStar}
                            className={`h-4 w-4 ${n <= rv.rating ? 'text-amber-400' : 'text-gray-200'}`}
                          />
                        ))}
                        <span className="ml-1 text-xs text-gray-400">
                          {new Date(rv.created_at).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {rv.service_request?.title && (
                        <p className="text-xs text-gray-500 mb-1.5 font-medium">
                          Job: {rv.service_request.title}
                        </p>
                      )}

                      {rv.comment ? (
                        <p className="text-sm text-gray-700 leading-relaxed">{rv.comment}</p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No written comment left.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
