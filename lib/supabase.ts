import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser/client (anon key — safe to expose). Session persistence + OAuth redirect handling on.
let browser: SupabaseClient | null = null;
export function supabaseBrowser() {
  if (!browser)
    browser = createClient(url, anon, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
        flowType: "pkce",
      },
    });
  return browser;
}

// Server-only admin client (service role). Never import into a client component.
export function supabaseAdmin() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
