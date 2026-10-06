'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/database';

/**
 * Redirects unauthenticated users to /login.
 * Optionally enforces a specific role, redirecting to / if the role doesn't match.
 *
 * Usage:
 *   useRequireAuth();              // any authenticated user
 *   useRequireAuth('artisan');     // artisan only
 *   useRequireAuth('admin');       // admin only
 */
export function useRequireAuth(requiredRole?: UserRole) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requiredRole && profile && profile.role !== requiredRole) {
      router.replace('/');
    }
  }, [user, profile, initialized, requiredRole, router, pathname]);

  return { user, profile, initialized };
}
