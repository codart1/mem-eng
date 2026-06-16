import type {
  Deck,
  VocabCard,
  ReviewLogEntry,
  AppSettings,
  DeckColor,
  Book,
  BookContent,
  Bookmark,
  Chapter,
  ReadingProgress,
} from "@/lib/types";

export interface NewDeckInput {
  name: string;
  description?: string;
  color?: DeckColor;
}

/** Content fields for a new card; bookkeeping (id, timestamps, fsrs) is filled by the repo. */
export type NewCardInput = Pick<VocabCard, "deckId" | "word" | "definition"> &
  Partial<
    Omit<
      VocabCard,
      | "id"
      | "deckId"
      | "word"
      | "definition"
      | "fsrs"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
    >
  >;

export interface DeckRepository {
  list(): Promise<Deck[]>;
  get(id: string): Promise<Deck | undefined>;
  create(input: NewDeckInput): Promise<Deck>;
  update(id: string, patch: Partial<Omit<Deck, "id">>): Promise<Deck | undefined>;
  /** Soft-deletes the deck and all of its cards. */
  remove(id: string): Promise<void>;
}

export interface CardRepository {
  listByDeck(deckId: string): Promise<VocabCard[]>;
  listAll(): Promise<VocabCard[]>;
  get(id: string): Promise<VocabCard | undefined>;
  create(input: NewCardInput): Promise<VocabCard>;
  createMany(inputs: NewCardInput[]): Promise<VocabCard[]>;
  update(
    id: string,
    patch: Partial<Omit<VocabCard, "id">>,
  ): Promise<VocabCard | undefined>;
  /** Persists post-grading FSRS state and appends the review log in one transaction. */
  applyReview(
    cardId: string,
    fsrs: VocabCard["fsrs"],
    log: Omit<ReviewLogEntry, "id">,
  ): Promise<void>;
  remove(id: string): Promise<void>;
  countByDeck(deckId: string): Promise<number>;
}

export interface ReviewRepository {
  listSince(since: number): Promise<ReviewLogEntry[]>;
  listByCard(cardId: string): Promise<ReviewLogEntry[]>;
  listAll(): Promise<ReviewLogEntry[]>;
}

export interface SettingsRepository {
  get(): Promise<AppSettings>;
  update(
    patch: Partial<Omit<AppSettings, "id">>,
  ): Promise<AppSettings>;
}

/** Everything needed to store a freshly parsed book (see `@/lib/epub`). */
export interface NewBookInput {
  title: string;
  author?: string;
  language?: string;
  cover?: Blob;
  fileName: string;
  fileSize: number;
  chapters: Chapter[];
  resources: Record<string, Blob>;
}

export interface BookRepository {
  list(): Promise<Book[]>;
  get(id: string): Promise<Book | undefined>;
  /** The heavy parsed content (chapters + image blobs), loaded on demand. */
  getContent(bookId: string): Promise<BookContent | undefined>;
  create(input: NewBookInput): Promise<Book>;
  /** Persist reading position; `lastReadAt` is stamped by the repo. */
  updateProgress(
    id: string,
    progress: Partial<Omit<ReadingProgress, "lastReadAt">>,
  ): Promise<void>;
  /** Removes the book, its content, and its bookmarks. */
  remove(id: string): Promise<void>;
}

export interface NewBookmarkInput {
  bookId: string;
  chapterIndex: number;
  type: Bookmark["type"];
  text?: string;
}

export interface BookmarkRepository {
  listByBook(bookId: string): Promise<Bookmark[]>;
  add(input: NewBookmarkInput): Promise<Bookmark>;
  remove(id: string): Promise<void>;
}

/** Serializable snapshot of all user data, for backup/restore. */
export interface DataSnapshot {
  version: 1;
  exportedAt: number;
  decks: Deck[];
  cards: VocabCard[];
  reviewLogs: ReviewLogEntry[];
  settings: AppSettings | null;
}

export interface Repository {
  decks: DeckRepository;
  cards: CardRepository;
  reviews: ReviewRepository;
  settings: SettingsRepository;
  books: BookRepository;
  bookmarks: BookmarkRepository;
  export(): Promise<DataSnapshot>;
  import(snapshot: DataSnapshot, mode: "merge" | "replace"): Promise<void>;
  reset(): Promise<void>;
}
