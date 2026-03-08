import { createClient } from '@supabase/supabase-js';

/**
 * CLIENT-SIDE Supabase client for use in React components (browser).
 * Uses NEXT_PUBLIC_ env vars which are safe to expose in the bundle.
 * For server-side/admin operations, use lib/supabase.ts instead.
 */
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
