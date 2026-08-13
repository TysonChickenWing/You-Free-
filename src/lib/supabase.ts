import { createClient } from '@supabase/supabase-js';

import type { Database } from '../types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Warn instead of throwing — `createClient` rejects an empty/invalid URL,
  // which would otherwise crash the Next.js build itself (it renders every
  // page, including client components, once server-side to produce the
  // static shell) whenever these env vars aren't set for a given
  // environment. A placeholder URL below keeps the build green; the app
  // will simply fail auth/data calls at runtime until the real env vars
  // are set, which is a much easier problem to diagnose than a dead build.
  console.warn(
    'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env locally, or set them in your Vercel project settings.'
  );
}

// Browser client — session persistence uses localStorage by default, which
// is exactly what we want here since every screen that touches this is a
// client component.
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
