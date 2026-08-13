'use client';

import type { Session } from '@supabase/supabase-js';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile(data ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      async signInWithPassword(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      async signUpWithPassword(email, password, fullName) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) return { error: error.message };

        // The DB trigger creates the profiles row from raw_user_meta_data,
        // but do a best-effort direct upsert too in case the session isn't
        // fully established yet when the trigger fires.
        if (data.user) {
          await supabase
            .from('profiles')
            .upsert({ id: data.user.id, full_name: fullName }, { onConflict: 'id' });
        }
        return { error: null };
      },
      async signOut() {
        await supabase.auth.signOut();
      },
      async refreshProfile() {
        if (session?.user) await loadProfile(session.user.id);
      },
    }),
    [session, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
