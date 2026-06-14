import { describe, it, expect } from "vitest";
import { Rating, State } from "ts-fsrs";
import { currentStreak, reviewsByDay, retentionRate, dayKey } from "./stats";
import type { ReviewLogEntry } from "@/lib/types";

const NOW = new Date("2026-06-14T12:00:00");
const DAY = 86_400_000;

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

describe("currentStreak", () => {
  it("is 0 with no logs", () => {
    expect(currentStreak([], NOW)).toBe(0);
  });

  it("counts consecutive days including today", () => {
    const logs = [
      log({ reviewedAt: NOW.getTime() }),
      log({ reviewedAt: NOW.getTime() - DAY }),
      log({ reviewedAt: NOW.getTime() - 2 * DAY }),
    ];
    expect(currentStreak(logs, NOW)).toBe(3);
  });

  it("does not break the streak if today is not yet studied", () => {
    const logs = [
      log({ reviewedAt: NOW.getTime() - DAY }),
      log({ reviewedAt: NOW.getTime() - 2 * DAY }),
    ];
    expect(currentStreak(logs, NOW)).toBe(2);
  });

  it("breaks on a missed day", () => {
    const logs = [
      log({ reviewedAt: NOW.getTime() }),
      log({ reviewedAt: NOW.getTime() - 3 * DAY }),
    ];
    expect(currentStreak(logs, NOW)).toBe(1);
  });
});

describe("reviewsByDay", () => {
  it("returns one bucket per day, newest last", () => {
    const logs = [
      log({ reviewedAt: NOW.getTime() }),
      log({ reviewedAt: NOW.getTime() }),
      log({ reviewedAt: NOW.getTime() - DAY }),
    ];
    const series = reviewsByDay(logs, 7, NOW);
    expect(series).toHaveLength(7);
    expect(series[6].count).toBe(2); // today
    expect(series[5].count).toBe(1); // yesterday
    expect(series[6].date).toBe(dayKey(NOW.getTime()));
  });
});

describe("retentionRate", () => {
  it("counts only mature reviews and excludes Again", () => {
    const logs = [
      log({ state: State.Review, rating: Rating.Good }),
      log({ state: State.Review, rating: Rating.Again }),
      log({ state: State.Learning, rating: Rating.Again }), // ignored
    ];
    expect(retentionRate(logs)).toBe(0.5);
  });

  it("is 0 with no mature reviews", () => {
    expect(retentionRate([log({ state: State.New })])).toBe(0);
  });
});
