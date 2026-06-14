import { State } from "ts-fsrs";
import type { AppSettings, ReviewLogEntry, VocabCard } from "@/lib/types";
import { startOfDay } from "@/lib/utils";

export interface DueCounts {
  /** Review/learning cards whose due time has passed (uncapped). */
  due: number;
  /** New cards available to introduce (uncapped). */
  new: number;
  /** Cards that will actually be queued today after daily limits. */
  queued: number;
}

export interface StudyQueue {
  /** Ordered, daily-limit-capped list of cards to study. */
  cards: VocabCard[];
  counts: DueCounts;
  newRemaining: number;
  reviewRemaining: number;
}

function isReviewState(card: VocabCard): boolean {
  return card.fsrs.state !== State.New;
}

/** Count today's already-completed reviews, split by new vs. review. */
export function reviewsDoneToday(
  logs: ReviewLogEntry[],
  nowDate: Date = new Date(),
): { newDone: number; reviewDone: number } {
  const dayStart = startOfDay(nowDate).getTime();
  let newDone = 0;
  let reviewDone = 0;
  for (const log of logs) {
    if (log.reviewedAt < dayStart) continue;
    if (log.state === State.New) newDone += 1;
    else reviewDone += 1;
  }
  return { newDone, reviewDone };
}

/**
 * Build the ordered study queue from a deck's (or all) cards, applying the
 * daily new/review limits. Pure function — easy to unit test.
 *
 * Order: due review/learning cards first (soonest due first), then new cards.
 */
export function buildStudyQueue(
  cards: VocabCard[],
  logs: ReviewLogEntry[],
  settings: AppSettings,
  nowDate: Date = new Date(),
): StudyQueue {
  const nowMs = nowDate.getTime();
  const { newDone, reviewDone } = reviewsDoneToday(logs, nowDate);

  const newRemaining = Math.max(0, settings.dailyNewLimit - newDone);
  const reviewRemaining =
    settings.dailyReviewLimit === 0
      ? Number.POSITIVE_INFINITY
      : Math.max(0, settings.dailyReviewLimit - reviewDone);

  const newCards = cards
    .filter((c) => !isReviewState(c))
    .sort((a, b) => a.createdAt - b.createdAt);

  const dueCards = cards
    .filter((c) => isReviewState(c) && c.fsrs.due.getTime() <= nowMs)
    .sort((a, b) => a.fsrs.due.getTime() - b.fsrs.due.getTime());

  const queuedDue = dueCards.slice(
    0,
    reviewRemaining === Number.POSITIVE_INFINITY ? undefined : reviewRemaining,
  );
  const queuedNew = newCards.slice(0, newRemaining);

  const queue = [...queuedDue, ...queuedNew];

  return {
    cards: queue,
    counts: {
      due: dueCards.length,
      new: newCards.length,
      queued: queue.length,
    },
    newRemaining,
    reviewRemaining,
  };
}

/** Lightweight due summary for badges/dashboard without building the full queue. */
export function summarizeDue(
  cards: VocabCard[],
  logs: ReviewLogEntry[],
  settings: AppSettings,
  nowDate: Date = new Date(),
): DueCounts {
  return buildStudyQueue(cards, logs, settings, nowDate).counts;
}
