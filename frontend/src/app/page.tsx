import { fetchCategories } from '@/services/categories';
import { ServiceCategory } from '@/types/database';
import { ApiRequestError } from '@/lib/api';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faMagnifyingGlass,
  faLocationDot,
  faShieldHalved,
  faStar,
  faFlag,
  faFaucet,
  faBolt,
  faHammer,
  faPaintRoller,
  faBroom,
  faCar,
  faWind,
  faPlug,
  faMobileScreen,
  faLaptop,
  faFireFlameSimple,
  faBorderAll,
  faBuilding,
  faCouch,
  faScissors,
  faCut,
  faPersonRays,
  faCamera,
  faUtensils,
  faScrewdriverWrench,
  faLeaf,
  faTruck,
} from '@fortawesome/free-solid-svg-icons';

// Map Font Awesome icon names (from DB) to imported icon definitions
const ICON_MAP: Record<string, IconDefinition> = {
  'fa-faucet': faFaucet,
  'fa-bolt': faBolt,
  'fa-hammer': faHammer,
  'fa-paint-roller': faPaintRoller,
  'fa-broom': faBroom,
  'fa-car': faCar,
  'fa-wind': faWind,
  'fa-plug': faPlug,
  'fa-mobile-screen': faMobileScreen,
  'fa-laptop': faLaptop,
  'fa-fire-flame-simple': faFireFlameSimple,
  'fa-border-all': faBorderAll,
  'fa-building': faBuilding,
  'fa-couch': faCouch,
  'fa-scissors': faScissors,
  'fa-cut': faCut,
  'fa-person-rays': faPersonRays,
  'fa-star': faStar,
  'fa-camera': faCamera,
  'fa-utensils': faUtensils,
  'fa-screwdriver-wrench': faScrewdriverWrench,
  'fa-leaf': faLeaf,
  'fa-truck': faTruck,
  // Search / location (UI icons)
  'fa-magnifying-glass': faMagnifyingGlass,
  'fa-location-dot': faLocationDot,
  'fa-shield-halved': faShieldHalved,
  'fa-flag': faFlag,
};

// ── Server-side data fetch ─────────────────────────────────────

async function getCategories(): Promise<ServiceCategory[]> {
  try {
    return await fetchCategories();
  } catch (err) {
    if (err instanceof ApiRequestError) {
      console.error('[page] Failed to load categories:', err.message);
    }
    return [];
  }
}

// ── Sub-components ─────────────────────────────────────────────

function CategoryCard({ category }: { category: ServiceCategory }) {
  const icon = category.icon ? ICON_MAP[category.icon] : null;

  return (
    <Link
      href={`/services?category=${category.slug}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-xl transition group-hover:bg-emerald-100">
        {icon ? (
          <FontAwesomeIcon icon={icon} className="h-5 w-5" />
        ) : (
          <span className="text-sm font-bold">{category.name[0]}</span>
        )}
      </span>
      <span className="text-center text-sm font-medium text-gray-700 leading-tight">
        {category.name}
      </span>
    </Link>
  );
}

function HowItWorksStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
        {step}
      </span>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{description}</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default async function Home() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Nav ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold text-emerald-600">HandyNG</span>
          <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
            <Link href="/services" className="hover:text-emerald-600 transition">
              Services
            </Link>
            <Link href="/artisans" className="hover:text-emerald-600 transition">
              Artisans
            </Link>
            <Link href="/how-it-works" className="hover:text-emerald-600 transition">
              How it works
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

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="bg-white pt-16 pb-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 mb-6 tracking-wide uppercase">
            Nigeria&rsquo;s trusted artisan marketplace
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl leading-tight">
            Find trusted local <span className="text-emerald-600">artisans</span> near you
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Connect with skilled, verified service providers in your area — from plumbers and
            electricians to tailors and photographers.
          </p>

          {/* ── Search bar ─────────────────────────────────── */}
          <form
            action="/artisans"
            method="GET"
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={ICON_MAP['fa-magnifying-glass']}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              />
              <input
                type="text"
                name="service"
                placeholder="What service do you need?"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
            <div className="relative flex-1 sm:max-w-[200px]">
              <FontAwesomeIcon
                icon={ICON_MAP['fa-location-dot']}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              />
              <input
                type="text"
                name="location"
                placeholder="Your location"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-emerald-700 transition whitespace-nowrap"
            >
              Find an Artisan
            </button>
          </form>
        </div>
      </section>

      {/* ── Service Categories ──────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Browse by category</h2>
              <p className="mt-1 text-sm text-gray-500">
                {categories.length > 0
                  ? `${categories.length} service categories available`
                  : 'Loading categories…'}
              </p>
            </div>
            <Link
              href="/services"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
            >
              View all →
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-12">How HandyNG works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <HowItWorksStep
              step="1"
              title="Search for a service"
              description="Tell us what you need and where you are. Browse verified artisans by category or location."
            />
            <HowItWorksStep
              step="2"
              title="View profiles & request"
              description="Check ratings, reviews, and portfolios. Send a service request directly to the artisan."
            />
            <HowItWorksStep
              step="3"
              title="Get the job done"
              description="The artisan accepts, completes the work, and you leave an honest review to help others."
            />
          </div>
        </div>
      </section>

      {/* ── Why trust HandyNG ───────────────────────────────── */}
      <section className="bg-emerald-50 py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-12">
            Why choose HandyNG?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                iconKey: 'fa-shield-halved',
                title: 'Verified artisans',
                desc: 'Every artisan goes through an identity and document verification process.',
              },
              {
                iconKey: 'fa-star',
                title: 'Honest reviews',
                desc: 'Reviews come only from customers who completed a real service request.',
              },
              {
                iconKey: 'fa-location-dot',
                title: 'Local first',
                desc: 'Find artisans in your neighbourhood, not hundreds of kilometres away.',
              },
              {
                iconKey: 'fa-flag',
                title: 'Safe reporting',
                desc: 'Report any suspicious activity. Our team reviews every report promptly.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <FontAwesomeIcon icon={ICON_MAP[item.iconKey]} className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="bg-emerald-600 py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-4 text-emerald-100 text-base">
            Join thousands of customers already finding trusted artisans near them.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition"
            >
              Find an artisan
            </Link>
            <Link
              href="/register?role=artisan"
              className="rounded-xl border border-emerald-400 px-8 py-3.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Register as artisan
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-gray-900 py-10 px-4">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold text-white">HandyNG</span>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} HandyNG. Local artisan marketplace for Nigeria.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/about" className="hover:text-white transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-white transition">
              Contact
            </Link>
            <Link href="/how-it-works" className="hover:text-white transition">
              How it works
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
