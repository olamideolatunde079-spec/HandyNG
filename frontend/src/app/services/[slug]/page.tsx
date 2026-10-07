import { fetchCategories, fetchCategoryBySlug } from '@/services/categories';
import { api } from '@/lib/api';
import { ServiceCategory, ArtisanProfile, Service, VerificationStatus } from '@/types/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faStar,
  faShieldHalved,
  faLocationDot,
  faMapMarkerAlt,
  faBriefcase,
} from '@fortawesome/free-solid-svg-icons';
import type { Metadata } from 'next';

// ── Types ──────────────────────────────────────────────────────

interface ServiceWithArtisan extends Service {
  artisan_profiles: Pick<
    ArtisanProfile,
    | 'id'
    | 'business_name'
    | 'average_rating'
    | 'total_reviews'
    | 'verification_status'
    | 'service_radius'
  > | null;
}

// ── Static params ──────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const categories = await fetchCategories();
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const cat = await fetchCategoryBySlug(slug);
    return {
      title: cat.name,
      description: cat.description ?? `Find trusted ${cat.name} artisans near you in Nigeria.`,
    };
  } catch {
    return { title: 'Category not found' };
  }
}

// ── Data fetching ──────────────────────────────────────────────

async function getCategoryData(
  slug: string
): Promise<{ category: ServiceCategory; services: ServiceWithArtisan[] }> {
  const [category, servicesRes] = await Promise.all([
    fetchCategoryBySlug(slug),
    api.get<ServiceWithArtisan[]>(`/api/v1/services?category_slug=${encodeURIComponent(slug)}`),
  ]);
  return { category, services: servicesRes.data };
}

// ── Sub-components ─────────────────────────────────────────────

function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status !== 'verified') return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5
                     text-xs font-semibold text-emerald-700"
    >
      <FontAwesomeIcon icon={faShieldHalved} className="h-2.5 w-2.5" />
      Verified
    </span>
  );
}

function ArtisanCard({ service }: { service: ServiceWithArtisan }) {
  const artisan = service.artisan_profiles;
  if (!artisan) return null;

  const name = artisan.business_name ?? 'Artisan';
  const rating = Number(artisan.average_rating).toFixed(1);

  return (
    <Link
      href={`/artisans/${artisan.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white
                 p-5 shadow-sm hover:border-emerald-200 hover:shadow-md transition"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition">
            {name}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <VerificationBadge status={artisan.verification_status} />
          </div>
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1 shrink-0">
          <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-sm font-semibold text-gray-700">{rating}</span>
          <span className="text-xs text-gray-400">({artisan.total_reviews})</span>
        </div>
      </div>

      {/* Service info */}
      <div>
        <p className="text-sm font-medium text-gray-800">{service.name}</p>
        {service.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{service.description}</p>
        )}
      </div>

      {/* Pricing + radius */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 pt-3
                      border-t border-gray-100 text-xs text-gray-500"
      >
        <span>
          {service.pricing_type === 'fixed' && service.price_from != null
            ? `₦${Number(service.price_from).toLocaleString()}`
            : service.pricing_type === 'starting_from' && service.price_from != null
              ? `From ₦${Number(service.price_from).toLocaleString()}`
              : service.pricing_type === 'negotiable'
                ? 'Negotiable'
                : 'Inspection required'}
        </span>
        {artisan.service_radius && (
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" />
            Up to {artisan.service_radius} km
          </span>
        )}
      </div>

      {/* CTA */}
      <span className="mt-auto text-xs font-semibold text-emerald-600 group-hover:underline">
        View profile →
      </span>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default async function ServiceCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let category: ServiceCategory;
  let services: ServiceWithArtisan[];

  try {
    ({ category, services } = await getCategoryData(slug));
  } catch {
    notFound();
  }

  const verified = services.filter(
    (s) => s.artisan_profiles?.verification_status === 'verified'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            HandyNG
          </Link>
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
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/services"
            className="flex items-center gap-1.5 hover:text-emerald-600 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
            All services
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category.name}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{category.name}</h1>
          {category.description && <p className="mt-2 text-gray-500">{category.description}</p>}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faBriefcase} className="h-4 w-4 text-emerald-500" />
              {services.length} service{services.length !== 1 ? 's' : ''} listed
            </span>
            {verified > 0 && (
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4 text-emerald-500" />
                {verified} verified artisan{verified !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Results */}
        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="mx-auto h-10 w-10 text-gray-200 mb-4"
            />
            <p className="text-sm font-medium text-gray-500">
              No artisans listed in this category yet.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Are you an artisan?{' '}
              <Link href="/register?role=artisan" className="text-emerald-600 hover:underline">
                Register and add your services
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <ArtisanCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 bg-white mt-16 py-8 px-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} HandyNG.
      </footer>
    </div>
  );
}
