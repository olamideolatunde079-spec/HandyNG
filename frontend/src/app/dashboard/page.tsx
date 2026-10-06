'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faClipboardList,
  faStar,
  faUser,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

export default function CustomerDashboardPage() {
  const { initialized } = useRequireAuth('customer');
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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            HandyNG
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:block">
              {profile.first_name} {profile.last_name}
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
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile.first_name}!</h1>
          <p className="mt-1 text-sm text-gray-500">Find and book trusted artisans near you.</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: faSearch,
              label: 'Find an artisan',
              desc: 'Search by service or location',
              href: '/artisans',
              color: 'emerald',
            },
            {
              icon: faClipboardList,
              label: 'My requests',
              desc: 'View and manage service requests',
              href: '/dashboard/requests',
              color: 'blue',
            },
            {
              icon: faStar,
              label: 'My reviews',
              desc: 'Reviews you have written',
              href: '/dashboard/reviews',
              color: 'amber',
            },
            {
              icon: faUser,
              label: 'Edit profile',
              desc: 'Update your information',
              href: '/dashboard/profile',
              color: 'gray',
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

        {/* Coming soon notice */}
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-gray-500">
            More dashboard features are coming in future phases.
          </p>
          <Link
            href="/artisans"
            className="mt-4 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Browse artisans now
          </Link>
        </div>
      </main>
    </div>
  );
}
