import type { Chapter } from "@/lib/types";

/**
 * Result of parsing an EPUB file in the browser. The chapters use the shared
 * {@link Chapter}/`ContentBlock` model so the reader renders them exactly like
 * news articles (tappable words, no raw HTML). `resources` holds the image
 * bytes referenced by image blocks, keyed by their normalized in-archive path.
 */
export interface ParsedBook {
  title: string;
  author?: string;
  language?: string;
  cover?: Blob;
  chapters: Chapter[];
  resources: Record<string, Blob>;
}
