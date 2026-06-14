import { describe, it, expect } from "vitest";
import { createEmptyCard, State } from "ts-fsrs";
import {
  getScheduler,
  gradeCard,
  schedulingPreview,
  isNew,
  isDue,
  formatInterval,
} from "./scheduler";
import { DEFAULT_SETTINGS, type AppSettings } from "@/lib/types";

const settings: AppSettings = { ...DEFAULT_SETTINGS, updatedAt: 0 };

describe("formatInterval", () => {
  it("formats sub-minute, minutes, hours, days, months, years", () => {
    expect(formatInterval(30_000)).toBe("<1m");
    expect(formatInterval(10 * 60_000)).toBe("10m");
    expect(formatInterval(3 * 3600_000)).toBe("3h");
    expect(formatInterval(5 * 86_400_000)).toBe("5d");
    expect(formatInterval(90 * 86_400_000)).toBe("3mo");
    expect(formatInterval(800 * 86_400_000)).toBe("2.2y");
  });
});

describe("scheduler", () => {
  it("treats a freshly created card as new", () => {
    const card = createEmptyCard(new Date());
    expect(isNew(card)).toBe(true);
    expect(card.state).toBe(State.New);
  });

  it("produces four monotonically non-decreasing interval previews", () => {
    const scheduler = getScheduler(settings);
    const card = createEmptyCard(new Date("2026-01-01T00:00:00Z"));
    const preview = schedulingPreview(
      scheduler,
      card,
      new Date("2026-01-01T00:00:00Z"),
    );
    expect(preview).toHaveLength(4);
    const intervals = preview.map((p) => p.intervalMs);
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]);
    }
    expect(preview.map((p) => p.key)).toEqual([
      "again",
      "hard",
      "good",
      "easy",
    ]);
    preview.forEach((p) => expect(p.intervalLabel).toBeTruthy());
  });

  it("advances a card out of the New state after a Good rating", () => {
    const scheduler = getScheduler(settings);
    const now = new Date("2026-01-01T00:00:00Z");
    const card = createEmptyCard(now);
    const { card: next, log } = gradeCard(scheduler, card, "good", now);
    expect(next.state).not.toBe(State.New);
    expect(next.reps).toBe(1);
    expect(log.rating).toBe(3); // Rating.Good
    expect(next.due.getTime()).toBeGreaterThan(now.getTime());
  });

  it("schedules Easy further out than Again", () => {
    const scheduler = getScheduler(settings);
    const now = new Date("2026-01-01T00:00:00Z");
    const card = createEmptyCard(now);
    const again = gradeCard(scheduler, card, "again", now).card;
    const easy = gradeCard(scheduler, card, "easy", now).card;
    expect(easy.due.getTime()).toBeGreaterThan(again.due.getTime());
  });

  it("isDue reflects the card due date", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const card = createEmptyCard(now);
    expect(isDue(card, now)).toBe(true);
    card.due = new Date(now.getTime() + 86_400_000);
    expect(isDue(card, now)).toBe(false);
  });
});
