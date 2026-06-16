import type { Card as FsrsCard, ReviewLog as FsrsReviewLog } from "ts-fsrs";

export type ID = string;

/** A collection of vocabulary cards. */
export interface Deck {
  id: ID;
  name: string;
  description?: string;
  /** A color token key from {@link DECK_COLORS}. */
  color: string;
  createdAt: number;
  updatedAt: number;
  /** Soft-delete marker, kept for future sync (last-write-wins). */
  deletedAt?: number | null;
}

/** A single dictionary sense for a word (part of speech + definition + examples). */
export interface Sense {
  partOfSpeech: string;
  definition: string;
  examples: string[];
}

/** A vocabulary flashcard. Owns its FSRS scheduling state. */
export interface VocabCard {
  id: ID;
  deckId: ID;
  word: string;
  phonetic?: string;
  /** Primary part of speech, denormalized for list/table display. */
  partOfSpeech?: string;
  /** Primary definition shown on the card back. */
  definition: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  /** Full multi-sense data (from AI or manual entry). */
  senses?: Sense[];
  /** CEFR level estimate: A1–C2. */
  cefr?: string;
  /** Optional memory hook. */
  mnemonic?: string;
  /** Optional native-language translation. */
  translation?: string;
  notes?: string;
  tags: string[];
  /** ts-fsrs scheduling state (due is a Date). */
  fsrs: FsrsCard;
  source: "manual" | "ai";
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

/** A persisted FSRS review event, used for analytics and the optimizer. */
export interface ReviewLogEntry extends FsrsReviewLog {
  id: ID;
  cardId: ID;
  deckId: ID;
  /** Epoch ms mirror of {@link FsrsReviewLog.review}, indexed for range queries. */
  reviewedAt: number;
}

/** Singleton app settings row. */
export interface AppSettings {
  id: "app";
  // FSRS parameters
  requestRetention: number;
  maximumInterval: number;
  enableFuzz: boolean;
  // Session limits
  dailyNewLimit: number;
  /** 0 = unlimited. */
  dailyReviewLimit: number;
  // AI
  /** Which model provider powers AI card generation. */
  aiProvider: AiProvider;
  /** Anthropic bring-your-own-key, stored locally only (never logged server-side). */
  byokApiKey?: string;
  /** OpenAI bring-your-own-key, stored locally only (never logged server-side). */
  openaiApiKey?: string;
  updatedAt: number;
}

/** Supported AI providers for card generation. */
export const AI_PROVIDERS = ["claude", "openai"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const DEFAULT_SETTINGS: Omit<AppSettings, "updatedAt"> = {
  id: "app",
  requestRetention: 0.9,
  maximumInterval: 36500,
  enableFuzz: true,
  dailyNewLimit: 20,
  dailyReviewLimit: 200,
  aiProvider: "claude",
};

/** Palette options for decks (keys map to oklch values in deck-color.ts). */
export const DECK_COLORS = [
  "teal",
  "amber",
  "rose",
  "violet",
  "emerald",
  "sky",
  "orange",
  "slate",
] as const;
export type DeckColor = (typeof DECK_COLORS)[number];

/**
 * A structured, sanitized piece of readable content. Books (and the news
 * reader) render only these block types — never raw HTML — so every text block
 * can carry tappable words and there's no HTML-injection surface. Image blocks
 * carry an in-archive resource path in `src`, resolved to an object URL at read
 * time (see {@link BookContent.resources}).
 */
export type ContentBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "image"; src: string; alt?: string; caption?: string };

/** One reading unit of a book (a spine item), rendered as a screen. */
export interface Chapter {
  /** Title from the EPUB nav/NCX, when known. */
  title?: string;
  /** The spine item's href, used to map TOC entries to chapters. */
  href: string;
  blocks: ContentBlock[];
}

/** Where the reader left off in a book (last-write-wins for a future sync). */
export interface ReadingProgress {
  chapterIndex: number;
  /** 0–1 scroll position within the chapter, for precise resume. */
  scrollRatio: number;
  /** 0–100 overall progress, denormalized for the library list. */
  pct: number;
  lastReadAt: number;
}

/** A book in the user's library. Heavy content lives in {@link BookContent}. */
export interface Book {
  id: ID;
  title: string;
  author?: string;
  language?: string;
  format: "epub";
  fileName: string;
  fileSize: number;
  /** Cover image bytes, shown in the library grid without loading content. */
  coverBlob?: Blob;
  chapterCount: number;
  progress: ReadingProgress;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

/** The extracted, renderable content of a book, keyed by {@link Book.id}. */
export interface BookContent {
  bookId: ID;
  chapters: Chapter[];
  /** In-archive image bytes by normalized path, for offline rendering. */
  resources: Record<string, Blob>;
}

/** A saved spot or auto-recorded vocab highlight within a book. */
export interface Bookmark {
  id: ID;
  bookId: ID;
  chapterIndex: number;
  /** "bookmark" = manual spot; "highlight" = auto-saved when a word was added. */
  type: "bookmark" | "highlight";
  /** Snippet (chapter title for a bookmark, the word/phrase for a highlight). */
  text?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

/** Shape returned by the AI word-lookup endpoint (validated by Zod). */
export interface GeneratedWord {
  word: string;
  phonetic?: string;
  cefr?: string;
  senses: Sense[];
  synonyms: string[];
  antonyms: string[];
  mnemonic?: string;
}
