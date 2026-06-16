"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  isSupabaseConfigured,
} from "./env";

/**
 * Browser Supabase client (cookie-backed session, shared by `@supabase/ssr` so
 * server route handlers can read the same session). Returns a memoized
 * singleton, or `null` when Supabase isn't configured — callers must handle the
 * null case and treat the user as anonymous/local-only.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (cached) return cached;
  cached = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return cached;
}
