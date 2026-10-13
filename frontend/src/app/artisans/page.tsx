import { fetchArtisans, ArtisanListItem } from '@/services/artisans';
import { fetchCategories } from '@/services/categories';
import { ServiceCategory } from '@/types/database';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faLocationDot,
  faShieldHalved,
  faStar,
  faBriefcase,
  faFilter,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';

export const metadata: Metadata = {
  title: 'Find Artisans',
  description: 'Browse skilled, verified artisans near you across Nigeria.',
};

// ── Data fetching ──────────────────────────────────────────────

async function getData(searchParams: Record<string, string>) {
  const [artisansRes, categories] = await Promise.all([
    fetchArtisans({
      search: searchParams.service || searchParams.search || undefined,
      category: searchParams.category || undefined,
      state: searchParams.state || undefined,
      city: searchParams.location || undefined,
      verified: searchParams.verified === 'true' ? true : undefined,
      min_rating: searchParams.min_rating ? parseFloat(searchParams.min_rating) : undefined,
      page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
    }).catch(() => ({ items: [], total: 0, page: 1, limit: 20, hasMore: false })),
    fetchCategories().catch(() => [] as ServiceCategory[]),
  ]);
  return { artisansRes, categories };
}

// ── Sub-components ─────────────────────────────────────────────

function ArtisanCard({ artisan }: { artisan: ArtisanListItem }) {
  const name =
    artisan.business_name ??
    `${artisan.profiles?.first_name ?? ''} ${artisan.profiles?.last_name ?? ''}`.trim() ??
    'Artisan';
  const location = [artisan.profiles?.city, artisan.profiles?.state].filter(Boolean).join(', ');
  const rating = Number(artisan.average_rating).toFixed(1);
  const verified = artisan.verification_status === 'verified';

  return (
    <Link
      href={`/artisans/${artisan.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white
                 p-5 shadow-sm hover:border-emerald-200 hover:shadow-md transition"
    >
      {/* Avatar + name row */}
      <div className="flex items-start gap-3">
        <div
          className="relative h-12 w-12 shrink-0 rounded-full bg-emerald-100
                        overflow-hidden flex items-center justify-center"
        >
          {artisan.profiles?.avatar_url ? (
            <Image
              src={artisan.profiles.avatar_url}
              alt={name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-emerald-700 font-bold text-sm">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition">
            {name}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {verified && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-emerald-100
                               px-2 py-0.5 text-xs font-semibold text-emerald-700"
              >
                <FontAwesomeIcon icon={faShieldHalved} className="h-2.5 w-2.5" />
                Verified
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" />
                {location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {artisan.bio && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{artisan.bio}</p>
      )}

      {/* Stats */}
      <div
        className="flex items-center justify-between text-xs text-gray-500 pt-3
                      border-t border-gray-100"
      >
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-semibold text-gray-700">{rating}</span>
          <span>({artisan.total_reviews})</span>
        </span>
        {artisan.years_experience != null && (
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faBriefcase} className="h-3 w-3" />
            {artisan.years_experience} yr{artisan.years_experience !== 1 ? 's' : ''}
          </span>
        )}
        {artisan.completed_jobs > 0 && <span>{artisan.completed_jobs} jobs</span>}
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default async function ArtisansPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const { artisansRes, categories } = await getData(sp);
  const { items: artisans, total, page, hasMore } = artisansRes;

  // Build next/prev page URLs preserving existing filters
  function pageUrl(p: number) {
    const q = new URLSearchParams(sp);
    q.set('page', String(p));
    return `/artisans?${q.toString()}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            HandyNG
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
            <Link href="/services" className="hover:text-emerald-600 transition">
              Services
            </Link>
            <Link href="/artisans" className="font-semibold text-emerald-600">
              Artisans
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Find artisans</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total > 0
              ? `${total} artisan${total !== 1 ? 's' : ''} found`
              : 'Search for artisans near you'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* ── Filters sidebar ── */}
          <aside>
            <form
              method="GET"
              action="/artisans"
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sticky top-24"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
                <FontAwesomeIcon icon={faFilter} className="h-3.5 w-3.5 text-gray-400" />
              </div>

              <div className="flex flex-col gap-4">
                {/* Search */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Search</label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
                    />
                    <input
                      type="text"
                      name="search"
                      defaultValue={sp.search ?? sp.service ?? ''}
                      placeholder="Service or name…"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3
                                 text-sm focus:border-emerald-400 focus:bg-white focus:outline-none
                                 focus:ring-2 focus:ring-emerald-100 transition"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Category</label>
                  <select
                    name="category"
                    defaultValue={sp.category ?? ''}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5
                               text-sm focus:border-emerald-400 focus:outline-none
                               focus:ring-2 focus:ring-emerald-100 transition"
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">State</label>
                  <input
                    type="text"
                    name="state"
                    defaultValue={sp.state ?? ''}
                    placeholder="e.g. Lagos"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5
                               text-sm focus:border-emerald-400 focus:outline-none
                               focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">City / Area</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={sp.location ?? sp.city ?? ''}
                    placeholder="e.g. Ikeja"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5
                               text-sm focus:border-emerald-400 focus:outline-none
                               focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>

                {/* Min rating */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Minimum rating</label>
                  <select
                    name="min_rating"
                    defaultValue={sp.min_rating ?? ''}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5
                               text-sm focus:border-emerald-400 focus:outline-none
                               focus:ring-2 focus:ring-emerald-100 transition"
                  >
                    <option value="">Any rating</option>
                    <option value="4">4+ stars</option>
                    <option value="4.5">4.5+ stars</option>
                  </select>
                </div>

                {/* Verified only */}
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="verified"
                    value="true"
                    defaultChecked={sp.verified === 'true'}
                    className="rounded border-gray-300 text-emerald-600
                               focus:ring-emerald-400 h-4 w-4"
                  />
                  <span className="text-sm text-gray-700">Verified artisans only</span>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold
                             text-white hover:bg-emerald-700 transition"
                >
                  Apply filters
                </button>

                {Object.keys(sp).length > 0 && (
                  <Link
                    href="/artisans"
                    className="text-center text-xs text-gray-400 hover:text-gray-600 transition"
                  >
                    Clear all filters
                  </Link>
                )}
              </div>
            </form>
          </aside>

          {/* ── Results ── */}
          <div>
            {artisans.length === 0 ? (
              <div
                className="rounded-2xl border border-dashed border-gray-200 bg-white
                              py-16 text-center"
              >
                <FontAwesomeIcon
                  icon={faUserTie}
                  className="mx-auto h-12 w-12 text-gray-200 mb-4"
                />
                <p className="text-sm font-medium text-gray-500">No artisans found</p>
                <p className="mt-1 text-xs text-gray-400">
                  Try adjusting your filters or{' '}
                  <Link href="/artisans" className="text-emerald-600 hover:underline">
                    clear all filters
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {artisans.map((a) => (
                    <ArtisanCard key={a.id} artisan={a} />
                  ))}
                </div>

                {/* Pagination */}
                {(page > 1 || hasMore) && (
                  <div className="mt-8 flex items-center justify-center gap-4">
                    {page > 1 && (
                      <Link
                        href={pageUrl(page - 1)}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-2.5
                                   text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        ← Previous
                      </Link>
                    )}
                    <span className="text-sm text-gray-500">Page {page}</span>
                    {hasMore && (
                      <Link
                        href={pageUrl(page + 1)}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-2.5
                                   text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        Next →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white mt-16 py-8 px-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} HandyNG. Local artisan marketplace for Nigeria.
      </footer>
    </div>
  );
}
