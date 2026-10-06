'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * Handles Supabase email confirmation and OAuth redirects.
 * Supabase sends users here after they click the link in their email.
 * We read the session and redirect to the correct dashboard.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    getSupabaseClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
          const role = session.user.user_metadata?.role ?? 'customer';
          if (role === 'artisan') router.replace('/artisan/dashboard');
          else if (role === 'admin') router.replace('/admin');
          else router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
      });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </span>
        <p className="text-sm text-gray-500">Verifying your account…</p>
      </div>
    </div>
  );
}
