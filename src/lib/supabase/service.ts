import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side only — uses the service role key to bypass RLS.
 * Never expose this client to the browser.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
