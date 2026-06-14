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
  aiProvider: "claude";
  /** Bring-your-own-key, stored locally only (never sent to our server logs). */
  byokApiKey?: string;
  updatedAt: number;
}

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
