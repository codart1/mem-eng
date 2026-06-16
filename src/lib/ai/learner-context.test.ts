import { describe, it, expect } from "vitest";
import { Rating, State, createEmptyCard, type Card as FsrsCard } from "ts-fsrs";
import { buildLearnerSnapshot } from "./learner-context";
import { DEFAULT_SETTINGS, type AppSettings, type Deck, type ReviewLogEntry, type VocabCard } from "@/lib/types";

const NOW = new Date("2026-06-14T12:00:00");
const DAY = 86_400_000;
const SETTINGS: AppSettings = { ...DEFAULT_SETTINGS, updatedAt: 0 };

function deck(over: Partial<Deck> & { id: string; name: string }): Deck {
  return {
    color: "teal",
    createdAt: 0,
    updatedAt: 0,
    deletedAt: null,
    ...over,
  };
}

function card(
  over: Partial<Omit<VocabCard, "fsrs">> & {
    id: string;
    deckId: string;
    word: string;
    fsrs?: Partial<FsrsCard>;
  },
): VocabCard {
  const { fsrs: fsrsOver, ...rest } = over;
  return {
    definition: "def",
    examples: [],
    synonyms: [],
    antonyms: [],
    tags: [],
    source: "manual",
    createdAt: NOW.getTime(),
    updatedAt: NOW.getTime(),
    deletedAt: null,
    ...rest,
    fsrs: { ...createEmptyCard(NOW), ...fsrsOver },
  };
}

function log(over: Partial<ReviewLogEntry>): ReviewLogEntry {
  return {
    id: Math.random().toString(),
    cardId: "c",
    deckId: "d",
    reviewedAt: NOW.getTime(),
    rating: Rating.Good,
    state: State.Review,
    due: NOW,
    review: NOW,
    stability: 1,
    difficulty: 1,
    elapsed_days: 0,
    last_elapsed_days: 0,
    scheduled_days: 1,
    learning_steps: 0,
    ...over,
  };
}

describe("buildLearnerSnapshot", () => {
  it("summarizes totals, streak, retention and CEFR", () => {
    const decks = [deck({ id: "d1", name: "Core" })];
    const cards = [
      card({ id: "c1", deckId: "d1", word: "alpha", cefr: "B1" }),
      card({ id: "c2", deckId: "d1", word: "beta", cefr: "B2" }),
      card({ id: "c3", deckId: "d1", word: "gamma" }), // no CEFR → unknown
    ];
    const logs = [
      log({ reviewedAt: NOW.getTime(), state: State.Review, rating: Rating.Good }),
      log({ reviewedAt: NOW.getTime() - DAY, state: State.Review, rating: Rating.Again }),
    ];

    const snap = buildLearnerSnapshot(decks, cards, logs, SETTINGS, NOW);

    expect(snap.totals.decks).toBe(1);
    expect(snap.totals.cards).toBe(3);
    expect(snap.streakDays).toBe(2);
    expect(snap.retentionPct).toBe(50);
    expect(snap.cefr).toEqual({ B1: 1, B2: 1, unknown: 1 });
    expect(snap.decks[0]).toMatchObject({ name: "Core", total: 3, new: 3 });
    expect(snap.reviewsRecent).toHaveLength(14);
    expect(snap.dueForecast).toHaveLength(7);
  });

  it("ranks struggling words by lapses (most first) and caps the list", () => {
    const decks = [deck({ id: "d1", name: "Core" })];
    const cards = [
      card({ id: "c1", deckId: "d1", word: "easy", fsrs: { lapses: 0 } }),
      card({ id: "c2", deckId: "d1", word: "tricky", fsrs: { lapses: 3, stability: 2 } }),
      card({ id: "c3", deckId: "d1", word: "hardest", fsrs: { lapses: 5, stability: 1 } }),
    ];

    const snap = buildLearnerSnapshot(decks, cards, [], SETTINGS, NOW);

    expect(snap.strugglingWords.map((w) => w.word)).toEqual(["hardest", "tricky"]);
    expect(snap.strugglingWords[0]).toMatchObject({ deck: "Core", lapses: 5 });
  });
});
