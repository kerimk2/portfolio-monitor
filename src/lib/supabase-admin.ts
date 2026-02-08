import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Admin client with service role key - bypasses RLS for write operations.
// Only use this in server-side code (API routes, scripts). Never import in client components.
// Lazy-initialized to avoid crashing at build time when env vars aren't set.
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }

    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }

  return _supabaseAdmin;
}
