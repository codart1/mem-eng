"use client";

import { useQuery } from "@tanstack/react-query";
import type { NewsArticle } from "@/lib/news/types";

/**
 * Fetch the latest aggregated English news. Needs a connection (this is a
 * discovery feature, like Discover); the rest of the app stays fully offline.
 * The server caches feeds for 15 minutes, so we keep the client cache short.
 */
export function useNews() {
  return useQuery<{ articles: NewsArticle[]; fetchedAt: number }>({
    queryKey: ["news"],
    queryFn: async () => {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error("Failed to load news.");
      const data = (await res.json()) as {
        articles?: NewsArticle[];
        fetchedAt?: number;
      };
      return { articles: data.articles ?? [], fetchedAt: data.fetchedAt ?? Date.now() };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
