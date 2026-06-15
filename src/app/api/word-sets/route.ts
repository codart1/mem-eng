import { NextResponse } from "next/server";
import { FEATURED_WORD_SETS } from "@/lib/word-sets/data";

// Curated, static content — safe to prerender at build time and serve from cache.
export const dynamic = "force-static";

/** Returns the staff-curated featured word sets the Discover page lists. */
export async function GET() {
  return NextResponse.json({ sets: FEATURED_WORD_SETS });
}
