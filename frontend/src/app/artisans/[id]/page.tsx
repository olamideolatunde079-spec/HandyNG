import { fetchArtisanProfile } from '@/services/artisans';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faShieldHalved,
  faStar,
  faLocationDot,
  faBriefcase,
  faCheck,
  faImages,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';

// ── Metadata ───────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const { artisan, profile } = await fetchArtisanProfile(id);
    const name = artisan.business_name ?? `${profile.first_name} ${profile.last_name}`;
    return {
      title: name,
      description: artisan.bio ?? `View ${name}'s profile on HandyNG.`,
    };
  } catch {
    return { title: 'Artisan profile' };
  }
}

// ── Sub-components ─────────────────────────────────────────────

function StarRating({ rating, total }: { rating: number; total: number }) {
  const r = Number(rating);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <FontAwesomeIcon
            key={n}
            icon={faStar}
            className={`h-4 w-4 ${n <= Math.round(r) ? 'text-amber-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-700">{r.toFixed(1)}</span>
      <span className="text-sm text-gray-400">
        ({total} review{total !== 1 ? 's' : ''})
      </span>
    </div>
  );
}

const PRICING_LABELS: Record<string, string> = {
  fixed: 'Fixed',
  starting_from: 'Starting from',
  negotiable: 'Negotiable',
  inspection_required: 'After inspection',
};

// ── Page ───────────────────────────────────────────────────────

export default async function ArtisanProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let data: Awaited<ReturnType<typeof fetchArtisanProfile>>;
  try {
    data = await fetchArtisanProfile(id);
  } catch {
    notFound();
  }

  const { artisan, profile, services, service_areas, portfolio, reviews } = data;

  const displayName = artisan.business_name ?? `${profile.first_name} ${profile.last_name}`.trim();
  const location = [profile.city, profile.state].filter(Boolean).join(', ');
  const verified = artisan.verification_status === 'verified';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/artisans"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            <span className="hidden sm:inline">Back to artisans</span>
          </Link>
          <Link href="/" className="text-xl font-bold text-emerald-600">
            HandyNG
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
          >
            Request service
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-6">
            {/* Profile card */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div
                  className="relative h-20 w-20 shrink-0 rounded-full bg-emerald-100
                                overflow-hidden flex items-center justify-center"
                >
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={displayName}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-emerald-700">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
                    {verified && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-100
                                       px-2.5 py-1 text-xs font-semibold text-emerald-700"
                      >
                        <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <StarRating rating={artisan.average_rating} total={artisan.total_reviews} />

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    {location && (
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4 text-gray-400" />
                        {location}
                      </span>
                    )}
                    {artisan.years_experience != null && (
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faBriefcase} className="h-4 w-4 text-gray-400" />
                        {artisan.years_experience} years experience
                      </span>
                    )}
                    {artisan.completed_jobs > 0 && (
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-gray-400" />
                        {artisan.completed_jobs} jobs completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {artisan.bio && (
                <p className="mt-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-5">
                  {artisan.bio}
                </p>
              )}
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faWrench} className="h-4 w-4 text-emerald-500" />
                  Services offered
                </h2>
                <div className="flex flex-col divide-y divide-gray-100">
                  {services.map((s) => (
                    <div key={s.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                          {s.service_categories && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {s.service_categories.name}
                            </p>
                          )}
                          {s.description && (
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                              {s.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-medium text-emerald-700">
                            {PRICING_LABELS[s.pricing_type]}
                          </p>
                          {s.price_from != null && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              ₦{Number(s.price_from).toLocaleString()}
                              {s.price_to != null && ` – ₦${Number(s.price_to).toLocaleString()}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {portfolio.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faImages} className="h-4 w-4 text-emerald-500" />
                  Portfolio
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                    >
                      <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faStar} className="h-4 w-4 text-amber-400" />
                  Reviews
                </h2>
                <div className="flex flex-col divide-y divide-gray-100">
                  {reviews.map((r) => (
                    <div key={r.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <FontAwesomeIcon
                              key={n}
                              icon={faStar}
                              className={`h-3.5 w-3.5 ${n <= r.rating ? 'text-amber-400' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(r.created_at).toLocaleDateString('en-NG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {r.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column — sticky CTA + service areas ── */}
          <div className="flex flex-col gap-5">
            {/* CTA card */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 sticky top-24">
              <p className="text-sm font-semibold text-gray-900 mb-1">Request a service</p>
              <p className="text-xs text-gray-500 mb-4">
                Send {displayName} a service request to get started.
              </p>
              <Link
                href={`/register`}
                className="block w-full rounded-xl bg-emerald-600 py-3 text-center text-sm
                           font-semibold text-white hover:bg-emerald-700 transition"
              >
                Request service
              </Link>
              <p className="mt-3 text-center text-xs text-gray-400">
                You need an account to request services.
              </p>
            </div>

            {/* Service areas */}
            {service_areas.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Service areas</h2>
                <div className="flex flex-col gap-2">
                  {service_areas.map((area) => (
                    <div key={area.id} className="flex items-start gap-2 text-sm text-gray-600">
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0"
                      />
                      <span>
                        {[area.area, area.city, area.state].filter(Boolean).join(', ')}
                        {area.radius_km && (
                          <span className="text-xs text-gray-400 ml-1">(±{area.radius_km} km)</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {Number(artisan.average_rating).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Rating</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{artisan.total_reviews}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Reviews</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{artisan.completed_jobs}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Jobs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white mt-16 py-8 px-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} HandyNG.
      </footer>
    </div>
  );
}
