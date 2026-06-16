import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  isSupabaseConfigured,
} from "./env";

/**
 * Server Supabase client for Route Handlers / Server Components, reading the
 * session from cookies via `@supabase/ssr`. Returns `null` when Supabase isn't
 * configured. `cookies()` is async in Next 16, hence the await.
 *
 * The `setAll` try/catch is the documented pattern: writing cookies throws when
 * called from a Server Component render (read-only context) — there it's a
 * harmless no-op because Proxy refreshes the session instead.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — ignored (Proxy handles refresh).
        }
      },
    },
  });
}
