import { createClient } from '@supabase/supabase-js';

import type { Database } from '../types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly at startup instead of surfacing as a confusing network error
  // the first time a query runs.
  console.warn(
    'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env and fill in your Supabase project values.'
  );
}

// Browser client — session persistence uses localStorage by default, which
// is exactly what we want here since every screen that touches this is a
// client component.
export const supabase = createClient<Database>(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
