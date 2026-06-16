import type { NewsCategory } from "./types";

/** A public RSS/Atom feed Lexio aggregates. All free, no API key required. */
export interface FeedSource {
  /** Publisher display name. */
  source: string;
  url: string;
  category: NewsCategory;
}

/**
 * Curated English-language news feeds. Reputable outlets with clean,
 * learner-appropriate writing and stable public RSS endpoints — no key, no
 * signup, no quota. Keep this list small so a single request stays fast.
 */
// NOTE: every publisher here must allow plain server-side fetching of its
// article pages, since the in-app reader extracts them. BBC was dropped because
// it blocks server fetches by TLS fingerprint (the reader could never load it).
export const NEWS_FEEDS: FeedSource[] = [
  // Top / general
  {
    source: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    category: "top",
  },
  // World
  {
    source: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
    category: "world",
  },
  // Business
  {
    source: "The Guardian",
    url: "https://www.theguardian.com/business/rss",
    category: "business",
  },
  {
    source: "CNBC",
    url: "https://www.cnbc.com/id/10001147/device/rss/rss.html",
    category: "business",
  },
  // Science
  {
    source: "ScienceDaily",
    url: "https://www.sciencedaily.com/rss/top/science.xml",
    category: "science",
  },
  {
    source: "NASA",
    url: "https://www.nasa.gov/news-release/feed/",
    category: "science",
  },
  {
    source: "The Guardian",
    url: "https://www.theguardian.com/science/rss",
    category: "science",
  },
  // Technology
  {
    source: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    category: "technology",
  },
  {
    source: "The Guardian",
    url: "https://www.theguardian.com/technology/rss",
    category: "technology",
  },
];

/**
 * Host suffixes whose article pages the in-app reader is allowed to fetch. This
 * is a security boundary: the /api/article route refuses any URL outside this
 * list so it can't be used to fetch arbitrary internal/external resources (SSRF).
 * Keep in sync with the publishers in {@link NEWS_FEEDS}.
 */
export const ALLOWED_ARTICLE_HOSTS = [
  "aljazeera.com",
  "theguardian.com",
  "cnbc.com",
  "sciencedaily.com",
  "theverge.com",
  "nasa.gov",
];

/** True when `url` is an http(s) page on an allowed publisher host. */
export function isAllowedArticleUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
  const host = parsed.hostname.toLowerCase();
  return ALLOWED_ARTICLE_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
}
