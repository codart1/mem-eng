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
// NOTE: the in-app reader fetches each publisher's article pages through impit
// (see ./http.ts), which impersonates a real Chrome TLS/HTTP fingerprint, so
// fingerprint-based blocking is no longer the constraint. These three sources
// were chosen for reliable, clean Readability extraction across many articles;
// together their section feeds cover every category in NEWS_CATEGORIES.
export const NEWS_FEEDS: FeedSource[] = [
  // The Guardian — open journalism, section feeds cover most categories.
  {
    source: "The Guardian",
    url: "https://www.theguardian.com/international/rss",
    category: "top",
  },
  {
    source: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
    category: "world",
  },
  {
    source: "The Guardian",
    url: "https://www.theguardian.com/business/rss",
    category: "business",
  },
  {
    source: "The Guardian",
    url: "https://www.theguardian.com/science/rss",
    category: "science",
  },
  {
    source: "The Guardian",
    url: "https://www.theguardian.com/technology/rss",
    category: "technology",
  },
  // The Verge — technology.
  {
    source: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    category: "technology",
  },
  // NASA — science, US-government public domain (effectively never blocks).
  {
    source: "NASA",
    url: "https://www.nasa.gov/news-release/feed/",
    category: "science",
  },
];

/**
 * Host suffixes whose article pages the in-app reader is allowed to fetch. This
 * is a security boundary: the /api/article route refuses any URL outside this
 * list so it can't be used to fetch arbitrary internal/external resources (SSRF).
 * Keep in sync with the publishers in {@link NEWS_FEEDS}.
 */
export const ALLOWED_ARTICLE_HOSTS = [
  "theguardian.com",
  "theverge.com",
  // Covers nasa.gov and science.nasa.gov (where many articles actually live).
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
