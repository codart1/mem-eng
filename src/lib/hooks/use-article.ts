"use client";

import { useQuery } from "@tanstack/react-query";
import type { ArticleContent } from "@/lib/news/types";

/**
 * Fetch the full, readable content of an article for the in-app reader. The
 * server extracts it from the publisher's page; results are cached aggressively
 * since a published article's content doesn't change.
 */
export function useArticle(url: string | undefined) {
  return useQuery<ArticleContent>({
    queryKey: ["article", url],
    enabled: !!url,
    queryFn: async () => {
      const res = await fetch(`/api/article?url=${encodeURIComponent(url!)}`);
      const data = (await res.json().catch(() => ({}))) as ArticleContent & {
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load the article.");
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
}
