'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import { UserRole } from '@/types/database';

// ── Types ──────────────────────────────────────────────────────

export interface AuthProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (
    email: string,
    password: string,
    meta: { first_name: string; last_name: string; role: UserRole }
  ) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    initialized: false,
  });

  // Fetch the user's profile from our profiles table
  const fetchProfile = useCallback(async (userId: string): Promise<AuthProfile | null> => {
    const { data, error } = await getSupabaseClient()
      .from('profiles')
      .select('id, user_id, first_name, last_name, role, avatar_url, phone, city, state')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data as AuthProfile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    setState((prev) => ({ ...prev, profile }));
  }, [state.user, fetchProfile]);

  // Bootstrap — get initial session
  useEffect(() => {
    let mounted = true;

    getSupabaseClient()
      .auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!mounted) return;

        const profile = session?.user ? await fetchProfile(session.user.id) : null;

        setState({
          user: session?.user ?? null,
          session,
          profile,
          loading: false,
          initialized: true,
        });
      });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = getSupabaseClient().auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      const profile = session?.user ? await fetchProfile(session.user.id) : null;

      setState({
        user: session?.user ?? null,
        session,
        profile,
        loading: false,
        initialized: true,
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // ── Auth actions ─────────────────────────────────────────────

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      meta: { first_name: string; last_name: string; role: UserRole }
    ) => {
      const { error } = await getSupabaseClient().auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: meta.first_name,
            last_name: meta.last_name,
            role: meta.role,
          },
          // Redirect to after email confirmation
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await getSupabaseClient().auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, signUp, signIn, signOut, resetPassword, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/**
 * Returns true while the auth state is being determined.
 * Use to prevent rendering authenticated content prematurely.
 */
export function useAuthLoading(): boolean {
  return useContext(AuthContext)?.loading ?? true;
}
