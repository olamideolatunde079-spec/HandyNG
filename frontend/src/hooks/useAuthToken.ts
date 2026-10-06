'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * Returns the current session's access token.
 * Re-fetches whenever the auth state changes.
 */
export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const client = getSupabaseClient();

    client.auth.getSession().then(({ data: { session } }) => {
      setToken(session?.access_token ?? null);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return token;
}
