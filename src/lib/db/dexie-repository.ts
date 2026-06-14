import { createEmptyCard } from "ts-fsrs";
import { db } from "./schema";
import {
  type Repository,
  type DeckRepository,
  type CardRepository,
  type ReviewRepository,
  type SettingsRepository,
  type NewDeckInput,
  type NewCardInput,
  type DataSnapshot,
} from "./repository";
import {
  type Deck,
  type VocabCard,
  type ReviewLogEntry,
  type AppSettings,
  DEFAULT_SETTINGS,
} from "@/lib/types";
import { uid, now } from "@/lib/utils";

const notDeleted = <T extends { deletedAt?: number | null }>(r: T) =>
  r.deletedAt == null;

const deckRepo: DeckRepository = {
  async list() {
    const decks = await db.decks.toArray();
    return decks
      .filter(notDeleted)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  async get(id) {
    const deck = await db.decks.get(id);
    return deck && notDeleted(deck) ? deck : undefined;
  },
  async create(input: NewDeckInput) {
    const ts = now();
    const deck: Deck = {
      id: uid(),
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      color: input.color ?? "teal",
      createdAt: ts,
      updatedAt: ts,
      deletedAt: null,
    };
    await db.decks.add(deck);
    return deck;
  },
  async update(id, patch) {
    const deck = await db.decks.get(id);
    if (!deck) return undefined;
    const updated: Deck = { ...deck, ...patch, id, updatedAt: now() };
    await db.decks.put(updated);
    return updated;
  },
  async remove(id) {
    const ts = now();
    await db.transaction("rw", db.decks, db.cards, async () => {
      await db.decks.update(id, { deletedAt: ts, updatedAt: ts });
      const cards = await db.cards.where("deckId").equals(id).toArray();
      await db.cards.bulkPut(
        cards.map((c) => ({ ...c, deletedAt: ts, updatedAt: ts })),
      );
    });
  },
};

function buildCard(input: NewCardInput): VocabCard {
  const ts = now();
  return {
    id: uid(),
    deckId: input.deckId,
    word: input.word.trim(),
    phonetic: input.phonetic,
    partOfSpeech: input.partOfSpeech,
    definition: input.definition.trim(),
    examples: input.examples ?? [],
    synonyms: input.synonyms ?? [],
    antonyms: input.antonyms ?? [],
    senses: input.senses,
    cefr: input.cefr,
    mnemonic: input.mnemonic,
    translation: input.translation,
    notes: input.notes,
    tags: input.tags ?? [],
    fsrs: createEmptyCard(ts),
    source: input.source ?? "manual",
    createdAt: ts,
    updatedAt: ts,
    deletedAt: null,
  };
}

const cardRepo: CardRepository = {
  async listByDeck(deckId) {
    const cards = await db.cards.where("deckId").equals(deckId).toArray();
    return cards
      .filter(notDeleted)
      .sort((a, b) => a.word.localeCompare(b.word));
  },
  async listAll() {
    const cards = await db.cards.toArray();
    return cards.filter(notDeleted);
  },
  async get(id) {
    const card = await db.cards.get(id);
    return card && notDeleted(card) ? card : undefined;
  },
  async create(input) {
    const card = buildCard(input);
    await db.cards.add(card);
    return card;
  },
  async createMany(inputs) {
    const cards = inputs.map(buildCard);
    await db.cards.bulkAdd(cards);
    return cards;
  },
  async update(id, patch) {
    const card = await db.cards.get(id);
    if (!card) return undefined;
    const updated: VocabCard = { ...card, ...patch, id, updatedAt: now() };
    await db.cards.put(updated);
    return updated;
  },
  async applyReview(cardId, fsrs, log) {
    await db.transaction("rw", db.cards, db.reviewLogs, async () => {
      const card = await db.cards.get(cardId);
      if (!card) return;
      await db.cards.put({ ...card, fsrs, updatedAt: now() });
      await db.reviewLogs.add({ ...log, id: uid() });
    });
  },
  async remove(id) {
    const ts = now();
    await db.cards.update(id, { deletedAt: ts, updatedAt: ts });
  },
  async countByDeck(deckId) {
    const cards = await db.cards.where("deckId").equals(deckId).toArray();
    return cards.filter(notDeleted).length;
  },
};

const reviewRepo: ReviewRepository = {
  async listSince(since) {
    return db.reviewLogs.where("reviewedAt").aboveOrEqual(since).toArray();
  },
  async listByCard(cardId) {
    return db.reviewLogs.where("cardId").equals(cardId).toArray();
  },
  async listAll() {
    return db.reviewLogs.toArray();
  },
};

const settingsRepo: SettingsRepository = {
  async get() {
    const existing = await db.settings.get("app");
    if (existing) return existing;
    const fresh: AppSettings = { ...DEFAULT_SETTINGS, updatedAt: now() };
    await db.settings.put(fresh);
    return fresh;
  },
  async update(patch) {
    const current = await settingsRepo.get();
    const updated: AppSettings = {
      ...current,
      ...patch,
      id: "app",
      updatedAt: now(),
    };
    await db.settings.put(updated);
    return updated;
  },
};

/** Rehydrate Date fields that became strings after JSON round-trips. */
function reviveCard(c: VocabCard): VocabCard {
  return {
    ...c,
    fsrs: {
      ...c.fsrs,
      due: new Date(c.fsrs.due),
      last_review: c.fsrs.last_review
        ? new Date(c.fsrs.last_review)
        : undefined,
    },
  };
}

function reviveLog(l: ReviewLogEntry): ReviewLogEntry {
  return { ...l, due: new Date(l.due), review: new Date(l.review) };
}

export const repository: Repository = {
  decks: deckRepo,
  cards: cardRepo,
  reviews: reviewRepo,
  settings: settingsRepo,

  async export() {
    const [decks, cards, reviewLogs, settings] = await Promise.all([
      db.decks.toArray(),
      db.cards.toArray(),
      db.reviewLogs.toArray(),
      db.settings.get("app"),
    ]);
    return {
      version: 1,
      exportedAt: now(),
      decks,
      cards,
      reviewLogs,
      settings: settings ?? null,
    };
  },

  async import(snapshot: DataSnapshot, mode) {
    const cards = snapshot.cards.map(reviveCard);
    const logs = snapshot.reviewLogs.map(reviveLog);
    await db.transaction(
      "rw",
      db.decks,
      db.cards,
      db.reviewLogs,
      db.settings,
      async () => {
        if (mode === "replace") {
          await Promise.all([
            db.decks.clear(),
            db.cards.clear(),
            db.reviewLogs.clear(),
          ]);
        }
        await db.decks.bulkPut(snapshot.decks);
        await db.cards.bulkPut(cards);
        await db.reviewLogs.bulkPut(logs);
        if (snapshot.settings) await db.settings.put(snapshot.settings);
      },
    );
  },

  async reset() {
    await db.transaction(
      "rw",
      db.decks,
      db.cards,
      db.reviewLogs,
      db.settings,
      async () => {
        await Promise.all([
          db.decks.clear(),
          db.cards.clear(),
          db.reviewLogs.clear(),
          db.settings.clear(),
        ]);
      },
    );
  },
};
