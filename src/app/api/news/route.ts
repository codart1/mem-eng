import { NextResponse } from "next/server";
import { NEWS_FEEDS } from "@/lib/news/feeds";
import { parseFeed } from "@/lib/news/parse";
import type { NewsArticle } from "@/lib/news/types";

export const runtime = "nodejs";
// Cache the aggregated feed for 15 minutes so we don't hammer publishers and
// responses stay fast. News doesn't need to be second-fresh.
export const revalidate = 900;

const MAX_ARTICLES = 80;
// Cap per category so high-volume feeds (BBC, Guardian) don't crowd out sparser
// topics — otherwise filtering to e.g. Technology could show nothing.
const MAX_PER_CATEGORY = 18;
const FEED_TIMEOUT_MS = 6000;

/** Fetch and parse a single feed, returning [] on any failure (never throws). */
async function loadFeed(
  feed: (typeof NEWS_FEEDS)[number],
  fetchedAt: number,
): Promise<NewsArticle[]> {
  try {
    const res = await fetch(feed.url, {
      headers: {
        // Some publishers reject the default fetch UA.
        "user-agent": "LexioNewsReader/1.0 (+https://lexio.app)",
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
      next: { revalidate },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseFeed(xml, {
      source: feed.source,
      category: feed.category,
      fetchedAt,
    });
  } catch {
    return [];
  }
}

/**
 * Merge feeds: drop dupes (by id and by normalized title), keep each category's
 * newest items so every filter has content, then return all kept items newest
 * first for the default "All" view.
 */
function merge(lists: NewsArticle[][]): NewsArticle[] {
  const byId = new Set<string>();
  const byTitle = new Set<string>();
  const deduped: NewsArticle[] = [];

  for (const article of lists.flat()) {
    const titleKey = article.title.toLowerCase().replace(/\s+/g, " ").trim();
    if (!article.title || byId.has(article.id) || byTitle.has(titleKey)) continue;
    byId.add(article.id);
    byTitle.add(titleKey);
    deduped.push(article);
  }

  deduped.sort((a, b) => b.publishedAt - a.publishedAt);

  const perCategory = new Map<string, number>();
  const kept: NewsArticle[] = [];
  for (const article of deduped) {
    const n = perCategory.get(article.category) ?? 0;
    if (n >= MAX_PER_CATEGORY) continue;
    perCategory.set(article.category, n + 1);
    kept.push(article);
  }

  return kept.slice(0, MAX_ARTICLES);
}

/** Returns the latest aggregated English news across all curated feeds. */
export async function GET() {
  const fetchedAt = Date.now();
  const lists = await Promise.all(NEWS_FEEDS.map((f) => loadFeed(f, fetchedAt)));
  const articles = merge(lists);

  return NextResponse.json(
    { articles, fetchedAt },
    {
      headers: {
        // Let the CDN/browser reuse the response for the revalidate window.
        "cache-control": `public, s-maxage=${revalidate}, stale-while-revalidate=600`,
      },
    },
  );
}
