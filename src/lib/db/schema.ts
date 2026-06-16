import Dexie, { type EntityTable } from "dexie";
import type {
  Deck,
  VocabCard,
  ReviewLogEntry,
  AppSettings,
  Book,
  BookContent,
  Bookmark,
} from "@/lib/types";

/**
 * Local-first IndexedDB database. All app data lives here so the app works
 * fully offline. Records carry `updatedAt` / `deletedAt` so a future remote
 * sync layer can reconcile with last-write-wins.
 *
 * Due-date filtering is done in memory (vocab decks are small), so indexes
 * stay simple and we avoid indexing Date keypaths.
 */
export class LexioDB extends Dexie {
  decks!: EntityTable<Deck, "id">;
  cards!: EntityTable<VocabCard, "id">;
  reviewLogs!: EntityTable<ReviewLogEntry, "id">;
  settings!: EntityTable<AppSettings, "id">;
  // Library (added in v2). Heavy parsed content/blobs live in `bookContents`,
  // kept separate so listing the library doesn't deserialize whole books.
  books!: EntityTable<Book, "id">;
  bookContents!: EntityTable<BookContent, "bookId">;
  bookmarks!: EntityTable<Bookmark, "id">;

  constructor() {
    super("lexio");
    this.version(1).stores({
      decks: "id, name, updatedAt",
      cards: "id, deckId, word, updatedAt",
      reviewLogs: "id, cardId, deckId, reviewedAt",
      settings: "id",
    });
    // v2 only declares the new tables; Dexie inherits the v1 stores unchanged.
    this.version(2).stores({
      books: "id, updatedAt",
      bookContents: "bookId",
      bookmarks: "id, bookId, createdAt",
    });
  }
}

export const db = new LexioDB();
