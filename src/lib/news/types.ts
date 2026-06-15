/** A single news story, normalized from any feed source. */
export interface NewsArticle {
  /** Stable id (the article link, or guid when present). */
  id: string;
  title: string;
  /** Plain-text summary (HTML stripped). May be empty for sparse feeds. */
  summary: string;
  /** Canonical link to the full story on the publisher's site. */
  link: string;
  /** Publisher display name, e.g. "BBC News". */
  source: string;
  /** Topic/category key from {@link NEWS_CATEGORIES}. */
  category: string;
  /** Publish time in epoch ms. Falls back to fetch time when the feed omits it. */
  publishedAt: number;
}

/** Topics the news feed is grouped by; also the filter chips on the page. */
export const NEWS_CATEGORIES = [
  "top",
  "world",
  "business",
  "science",
  "technology",
] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];
