import { describe, it, expect } from "vitest";
import { createEmptyCard, State } from "ts-fsrs";
import { buildStudyQueue, reviewsDoneToday } from "./queue";
import { DEFAULT_SETTINGS, type AppSettings, type VocabCard, type ReviewLogEntry } from "@/lib/types";

const NOW = new Date("2026-06-14T12:00:00Z");

function makeCard(opts: {
  id: string;
  state?: State;
  dueOffsetMs?: number;
  createdAt?: number;
}): VocabCard {
  const fsrs = createEmptyCard(NOW);
  fsrs.state = opts.state ?? State.New;
  fsrs.due = new Date(NOW.getTime() + (opts.dueOffsetMs ?? 0));
  return {
    id: opts.id,
    deckId: "d1",
    word: opts.id,
    definition: "def",
    examples: [],
    synonyms: [],
    antonyms: [],
    tags: [],
    fsrs,
    source: "manual",
    createdAt: opts.createdAt ?? NOW.getTime(),
    updatedAt: NOW.getTime(),
  };
}

const settings = (over: Partial<AppSettings> = {}): AppSettings => ({
  ...DEFAULT_SETTINGS,
  updatedAt: 0,
  ...over,
});

describe("reviewsDoneToday", () => {
  it("splits today's logs into new vs review", () => {
    const logs = [
      { reviewedAt: NOW.getTime(), state: State.New },
      { reviewedAt: NOW.getTime(), state: State.Review },
      { reviewedAt: NOW.getTime(), state: State.Learning },
      // yesterday — ignored
      { reviewedAt: NOW.getTime() - 86_400_000, state: State.Review },
    ] as ReviewLogEntry[];
    const { newDone, reviewDone } = reviewsDoneToday(logs, NOW);
    expect(newDone).toBe(1);
    expect(reviewDone).toBe(2);
  });
});

describe("buildStudyQueue", () => {
  const cards = [
    makeCard({ id: "new1", state: State.New, createdAt: 1 }),
    makeCard({ id: "new2", state: State.New, createdAt: 2 }),
    makeCard({ id: "new3", state: State.New, createdAt: 3 }),
    makeCard({ id: "due1", state: State.Review, dueOffsetMs: -3_600_000 }),
    makeCard({ id: "due2", state: State.Review, dueOffsetMs: -7_200_000 }),
    makeCard({ id: "future", state: State.Review, dueOffsetMs: 86_400_000 }),
  ];

  it("caps new cards by the daily new limit and excludes future reviews", () => {
    const q = buildStudyQueue(cards, [], settings({ dailyNewLimit: 2, dailyReviewLimit: 0 }), NOW);
    expect(q.counts.due).toBe(2); // due1, due2 (future excluded)
    expect(q.counts.new).toBe(3); // all new available
    expect(q.counts.queued).toBe(4); // 2 due + 2 new (capped)
    // Order: due cards first (soonest-due first), then new (oldest first)
    expect(q.cards.map((c) => c.id)).toEqual(["due2", "due1", "new1", "new2"]);
  });

  it("respects a finite daily review limit", () => {
    const q = buildStudyQueue(cards, [], settings({ dailyNewLimit: 10, dailyReviewLimit: 1 }), NOW);
    expect(q.cards.filter((c) => c.id.startsWith("due"))).toHaveLength(1);
  });

  it("reduces remaining capacity by reviews already done today", () => {
    const logs = [
      { reviewedAt: NOW.getTime(), state: State.New, deckId: "d1" },
      { reviewedAt: NOW.getTime(), state: State.New, deckId: "d1" },
    ] as ReviewLogEntry[];
    const q = buildStudyQueue(cards, logs, settings({ dailyNewLimit: 2 }), NOW);
    expect(q.newRemaining).toBe(0);
    expect(q.cards.some((c) => c.fsrs.state === State.New)).toBe(false);
  });
});
