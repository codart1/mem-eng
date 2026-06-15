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
export const NEWS_FEEDS: FeedSource[] = [
  // Top / general
  { source: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", category: "top" },
  { source: "NPR", url: "https://feeds.npr.org/1001/rss.xml", category: "top" },
  // World
  {
    source: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    category: "world",
  },
  {
    source: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
    category: "world",
  },
  // Business
  {
    source: "BBC Business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    category: "business",
  },
  // Science
  {
    source: "BBC Science",
    url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    category: "science",
  },
  {
    source: "NASA",
    url: "https://www.nasa.gov/news-release/feed/",
    category: "science",
  },
  // Technology
  {
    source: "BBC Technology",
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    category: "technology",
  },
];
