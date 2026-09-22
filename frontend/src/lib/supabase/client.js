import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gzxoodmqqrweknwghnzz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
