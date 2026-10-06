'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faStar,
  faUser,
  faBriefcase,
  faImages,
  faShieldHalved,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

export default function ArtisanDashboardPage() {
  const { initialized } = useRequireAuth('artisan');
  const { profile, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  if (!initialized || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            HandyNG
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:block">
              {profile.first_name} {profile.last_name}
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Artisan
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition"
              aria-label="Sign out"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile.first_name}!</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your services and incoming requests.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: faClipboardList,
              label: 'Service requests',
              href: '/artisan/requests',
              desc: 'View and respond to requests',
            },
            {
              icon: faBriefcase,
              label: 'My services',
              href: '/artisan/services',
              desc: 'Add and manage your services',
            },
            {
              icon: faImages,
              label: 'Portfolio',
              href: '/artisan/portfolio',
              desc: 'Showcase your work',
            },
            {
              icon: faStar,
              label: 'My reviews',
              href: '/artisan/reviews',
              desc: 'Reviews from customers',
            },
            {
              icon: faShieldHalved,
              label: 'Verification',
              href: '/artisan/verification',
              desc: 'Submit documents for verification',
            },
            {
              icon: faUser,
              label: 'Edit profile',
              href: '/artisan/profile',
              desc: 'Update your business profile',
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-emerald-200 hover:shadow-md transition"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-gray-500">
            Full artisan features are coming in future phases.
          </p>
        </div>
      </main>
    </div>
  );
}
