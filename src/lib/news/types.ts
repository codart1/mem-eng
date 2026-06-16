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
  /** Thumbnail image from the feed (media:thumbnail/enclosure), if provided. */
  image?: string;
}

/**
 * A structured, sanitized piece of an extracted article. The server emits only
 * these block types (never raw HTML), so the reader can render every text block
 * with tappable words and there's no HTML-injection surface.
 */
export type ArticleBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "image"; src: string; alt?: string; caption?: string };

/** Full readable article content extracted from a publisher's page. */
export interface ArticleContent {
  url: string;
  title: string;
  byline?: string;
  siteName?: string;
  /** Cover image (Open Graph / Twitter card), absolute URL. */
  leadImage?: string;
  /** Estimated read time in minutes. */
  readingMinutes: number;
  blocks: ArticleBlock[];
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
