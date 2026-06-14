import Dexie, { type EntityTable } from "dexie";
import type { Deck, VocabCard, ReviewLogEntry, AppSettings } from "@/lib/types";

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

  constructor() {
    super("lexio");
    this.version(1).stores({
      decks: "id, name, updatedAt",
      cards: "id, deckId, word, updatedAt",
      reviewLogs: "id, cardId, deckId, reviewedAt",
      settings: "id",
    });
  }
}

export const db = new LexioDB();
