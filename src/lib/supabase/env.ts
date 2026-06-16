/**
 * Supabase configuration, read from public env vars. Auth + sync are entirely
 * optional: when these aren't set, {@link isSupabaseConfigured} is false and the
 * whole cloud layer disables itself so the app keeps working offline.
 *
 * The key is Supabase's new-style *publishable* key (`sb_publishable_…`), which
 * supersedes the legacy anon key. Both are safe to expose to the browser and
 * both work with `@supabase/ssr`.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_PUBLISHABLE_KEY.length > 0;
