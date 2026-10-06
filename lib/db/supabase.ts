import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client configuration for Port 443 (HTTPS REST API).
 * Unlike direct Postgres TCP connections (ports 5432 / 6543),
 * the Supabase HTTPS API operates over port 443, making it 100% reachable
 * even on restricted public networks, university Wi-Fi, and firewalls.
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://fctanziyohhansctrdvt.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Anon client: used for public/authenticated queries respecting Row-Level Security (RLS)
export const supabaseAnonClient = createClient(
  supabaseUrl,
  supabaseAnonKey || supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Admin client: used for server-side operations (bypasses RLS)
export const supabaseAdminClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export const supabase = supabaseAdminClient;
