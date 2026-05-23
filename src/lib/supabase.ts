import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Add the auth header to clear the schema cache for each request
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  // This helps prevent cached schema errors during development
  global: {
    headers: { 'x-client-info': 'supabase-js-nextjs' },
  },
});