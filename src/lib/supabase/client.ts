import { createBrowserClient } from '@supabase/ssr'; // Use createBrowserClient for client-side

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase env vars');
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Check your .env.local file.");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
