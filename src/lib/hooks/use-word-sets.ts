"use client";

import { useQuery } from "@tanstack/react-query";
import type { FeaturedWordSet } from "@/lib/word-sets/data";

/**
 * Fetch the staff-curated featured word sets from the server. They rarely
 * change, so we cache aggressively. Needs a connection (this is a discovery
 * feature); the rest of the app stays fully offline.
 */
export function useWordSets() {
  return useQuery<FeaturedWordSet[]>({
    queryKey: ["word-sets"],
    queryFn: async () => {
      const res = await fetch("/api/word-sets");
      if (!res.ok) throw new Error("Failed to load word sets.");
      const data = (await res.json()) as { sets?: FeaturedWordSet[] };
      return data.sets ?? [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
