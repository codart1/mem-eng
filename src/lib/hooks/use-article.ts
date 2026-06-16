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
      try {
        const res = await fetch(`/api/article?url=${encodeURIComponent(url!)}`);
        const data = (await res.json().catch((err) => {
          console.error("[useArticle] Failed to parse JSON response:", err);
          return {};
        })) as ArticleContent & {
          error?: string;
          message?: string;
          stack?: string;
        };
        if (!res.ok) {
          let errMsg = data.error ?? `Failed to load the article. (HTTP status: ${res.status})`;
          if (data.message) {
            errMsg += ` - Details: ${data.message}`;
          }
          if (data.stack) {
            errMsg += `\nServer Stack Trace:\n${data.stack}`;
          }
          throw new Error(errMsg);
        }
        return data;
      } catch (err) {
        console.error("[useArticle] Error fetching article:", err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
}
