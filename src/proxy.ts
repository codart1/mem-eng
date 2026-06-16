import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

/**
 * Proxy (Next 16's renamed Middleware, Node runtime). Its only job is to keep
 * the Supabase auth token fresh by round-tripping the session cookie on each
 * request — it deliberately does NOT gate any routes, because accounts are
 * optional and the app must stay fully usable while signed out.
 *
 * No-ops entirely when Supabase isn't configured.
 */
export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touching getUser() triggers a token refresh and the setAll() above.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Run on app pages, but skip static assets, the PWA shell files, and API
  // routes (those authenticate via their own server client when needed).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
