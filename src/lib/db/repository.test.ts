import { describe, it, expect, beforeEach } from "vitest";
import { repository } from "./dexie-repository";
import { getScheduler, gradeCard } from "@/lib/srs/scheduler";
import { DEFAULT_SETTINGS, type AppSettings, type ReviewLogEntry } from "@/lib/types";

const settings: AppSettings = { ...DEFAULT_SETTINGS, updatedAt: 0 };

beforeEach(async () => {
  await repository.reset();
});

describe("deck + card repository", () => {
  it("creates a deck and lists its cards", async () => {
    const deck = await repository.decks.create({ name: "Test", color: "rose" });
    await repository.cards.create({
      deckId: deck.id,
      word: "serendipity",
      definition: "a happy accident",
    });
    const cards = await repository.cards.listByDeck(deck.id);
    expect(cards).toHaveLength(1);
    expect(cards[0].word).toBe("serendipity");
    expect(cards[0].fsrs.due).toBeInstanceOf(Date);
  });

  it("soft-deletes a deck and cascades to its cards", async () => {
    const deck = await repository.decks.create({ name: "Temp" });
    await repository.cards.create({
      deckId: deck.id,
      word: "ephemeral",
      definition: "short-lived",
    });
    await repository.decks.remove(deck.id);
    expect(await repository.decks.get(deck.id)).toBeUndefined();
    expect(await repository.cards.listByDeck(deck.id)).toHaveLength(0);
    expect((await repository.decks.list()).length).toBe(0);
  });

  it("applies a review: updates fsrs state and appends a log", async () => {
    const deck = await repository.decks.create({ name: "Study" });
    const card = await repository.cards.create({
      deckId: deck.id,
      word: "lucid",
      definition: "clear",
    });
    const scheduler = getScheduler(settings);
    const now = new Date();
    const { card: nextFsrs, log } = gradeCard(scheduler, card.fsrs, "good", now);
    await repository.cards.applyReview(card.id, nextFsrs, {
      ...log,
      cardId: card.id,
      deckId: deck.id,
      reviewedAt: now.getTime(),
    } as Omit<ReviewLogEntry, "id">);

    const updated = await repository.cards.get(card.id);
    expect(updated?.fsrs.reps).toBe(1);
    const logs = await repository.reviews.listByCard(card.id);
    expect(logs).toHaveLength(1);
    expect(logs[0].rating).toBe(3);
  });

  it("exports and re-imports data, reviving Date fields", async () => {
    const deck = await repository.decks.create({ name: "Backup" });
    await repository.cards.create({
      deckId: deck.id,
      word: "verbatim",
      definition: "word for word",
    });

    // JSON round-trip turns Dates into strings.
    const snapshot = JSON.parse(JSON.stringify(await repository.export()));
    await repository.reset();
    expect(await repository.decks.list()).toHaveLength(0);

    await repository.import(snapshot, "replace");
    const cards = await repository.cards.listByDeck(deck.id);
    expect(cards).toHaveLength(1);
    expect(cards[0].fsrs.due).toBeInstanceOf(Date);
    expect(cards[0].word).toBe("verbatim");
  });
});

describe("settings repository", () => {
  it("returns defaults then persists updates", async () => {
    const s = await repository.settings.get();
    expect(s.requestRetention).toBe(DEFAULT_SETTINGS.requestRetention);
    const updated = await repository.settings.update({ dailyNewLimit: 42 });
    expect(updated.dailyNewLimit).toBe(42);
    expect((await repository.settings.get()).dailyNewLimit).toBe(42);
  });
});
