import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  'https://gzxoodmqqrweknwghnzz.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  '';

export function createClient() {
  if (!supabaseAnonKey) {
    console.error(
      '[Supabase Client Error] Supabase Anon Key is missing. Ensure SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY is set in Vercel environment variables.'
    );
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
