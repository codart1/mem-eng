import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/**
 * Service-role Supabase client for trusted server-only work (the Lemon Squeezy
 * webhook crediting accounts). Uses the secret key, which bypasses RLS — NEVER
 * import this into client code. Returns null when the secret key isn't set.
 *
 * The secret key is the new-style `sb_secret_…` key (Project Settings → API),
 * which supersedes the legacy service_role JWT.
 */
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY ?? "";

export const isSupabaseAdminConfigured =
  SUPABASE_URL.length > 0 && SECRET_KEY.length > 0;

let cached: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured) return null;
  if (cached) return cached;
  cached = createClient(SUPABASE_URL, SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
