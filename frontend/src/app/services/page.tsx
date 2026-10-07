import { fetchCategories } from '@/services/categories';
import { ServiceCategory } from '@/types/database';
import { ApiRequestError } from '@/lib/api';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
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
  faStar,
  faCamera,
  faUtensils,
  faScrewdriverWrench,
  faLeaf,
  faTruck,
  faChevronRight,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Services',
  description: 'Find skilled artisans across 23 service categories in Nigeria.',
};

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
};

async function getCategories(): Promise<ServiceCategory[]> {
  try {
    return await fetchCategories();
  } catch (err) {
    if (err instanceof ApiRequestError) console.error('[services]', err.message);
    return [];
  }
}

function CategoryCard({ category }: { category: ServiceCategory }) {
  const icon = category.icon ? ICON_MAP[category.icon] : null;
  return (
    <Link
      href={`/services/${category.slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white
                 p-5 shadow-sm hover:border-emerald-200 hover:shadow-md transition"
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
                       bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100"
      >
        {icon ? (
          <FontAwesomeIcon icon={icon} className="h-5 w-5" />
        ) : (
          <span className="text-sm font-bold">{category.name[0]}</span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">{category.name}</p>
        {category.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{category.description}</p>
        )}
      </div>
      <FontAwesomeIcon
        icon={faChevronRight}
        className="h-3.5 w-3.5 text-gray-300 shrink-0 group-hover:text-emerald-500 transition"
      />
    </Link>
  );
}

export default async function ServicesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            HandyNG
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
            <Link href="/services" className="font-semibold text-emerald-600">
              Services
            </Link>
            <Link href="/artisans" className="hover:text-emerald-600 transition">
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

      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Browse services</h1>
          <p className="mt-3 text-gray-500">
            {categories.length} categories · Find the right artisan for any job
          </p>

          {/* Quick search */}
          <form action="/artisans" method="GET" className="mx-auto mt-6 flex max-w-lg gap-3">
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              />
              <input
                type="text"
                name="service"
                placeholder="Search for a service…"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4
                           text-sm focus:border-emerald-400 focus:outline-none focus:ring-2
                           focus:ring-emerald-100 transition"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white
                         hover:bg-emerald-700 transition whitespace-nowrap"
            >
              Find
            </button>
          </form>
        </div>

        {/* Category grid */}
        {categories.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>Could not load categories. Please try again.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-16 py-8 px-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} HandyNG. Local artisan marketplace for Nigeria.
      </footer>
    </div>
  );
}
