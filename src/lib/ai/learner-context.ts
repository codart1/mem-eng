import type { AppSettings, Deck, ReviewLogEntry, VocabCard } from "@/lib/types";
import {
  currentStreak,
  retentionRate,
  reviewsByDay,
  dueForecast,
  stateBreakdown,
} from "@/lib/stats";
import { buildStudyQueue } from "@/lib/srs/queue";

const MAX_DECKS = 20;
const MAX_STRUGGLING = 15;
const REVIEW_WINDOW = 14;
const FORECAST_WINDOW = 7;

interface DeckSummary {
  name: string;
  total: number;
  due: number;
  new: number;
}

interface StrugglingWord {
  word: string;
  deck: string;
  lapses: number;
}

/**
 * A compact, bounded summary of the learner's data, built entirely client-side
 * and sent (stringified) to the chat model so it can ground its answers. Reuses
 * the same stats helpers the dashboard/stats pages use, so the numbers match
 * what the user sees in the UI.
 */
export interface LearnerSnapshot {
  generatedAt: string;
  totals: { decks: number; cards: number; due: number; new: number };
  streakDays: number;
  /** Mature-review retention, 0–100. */
  retentionPct: number;
  states: { new: number; learning: number; review: number };
  /** Daily review counts, oldest → newest. */
  reviewsRecent: { date: string; count: number }[];
  /** Cards becoming due over the next week (day 0 = today). */
  dueForecast: { label: string; count: number }[];
  /** Card counts by CEFR band (e.g. { B1: 12, B2: 30 }); "unknown" for missing. */
  cefr: Record<string, number>;
  decks: DeckSummary[];
  /** Words the learner has lapsed on most — candidates for extra practice. */
  strugglingWords: StrugglingWord[];
}

export function buildLearnerSnapshot(
  decks: Deck[],
  cards: VocabCard[],
  logs: ReviewLogEntry[],
  settings: AppSettings,
  now: Date = new Date(),
): LearnerSnapshot {
  const overall = buildStudyQueue(cards, logs, settings, now).counts;
  const states = stateBreakdown(cards);

  const cefr: Record<string, number> = {};
  for (const c of cards) {
    const key = c.cefr?.trim() || "unknown";
    cefr[key] = (cefr[key] ?? 0) + 1;
  }

  const deckName = new Map(decks.map((d) => [d.id, d.name]));
  const deckSummaries: DeckSummary[] = decks
    .map((deck) => {
      const deckCards = cards.filter((c) => c.deckId === deck.id);
      const counts = buildStudyQueue(
        deckCards,
        logs.filter((l) => l.deckId === deck.id),
        settings,
        now,
      ).counts;
      return {
        name: deck.name,
        total: deckCards.length,
        due: counts.due,
        new: counts.new,
      };
    })
    .sort((a, b) => b.due - a.due || b.total - a.total)
    .slice(0, MAX_DECKS);

  const strugglingWords: StrugglingWord[] = cards
    .filter((c) => c.fsrs.lapses > 0)
    .sort((a, b) => b.fsrs.lapses - a.fsrs.lapses || a.fsrs.stability - b.fsrs.stability)
    .slice(0, MAX_STRUGGLING)
    .map((c) => ({
      word: c.word,
      deck: deckName.get(c.deckId) ?? "",
      lapses: c.fsrs.lapses,
    }));

  return {
    generatedAt: now.toISOString(),
    totals: {
      decks: decks.length,
      cards: cards.length,
      due: overall.due,
      new: overall.new,
    },
    streakDays: currentStreak(logs, now),
    retentionPct: Math.round(retentionRate(logs) * 100),
    states,
    reviewsRecent: reviewsByDay(logs, REVIEW_WINDOW, now).map((d) => ({
      date: d.date,
      count: d.count,
    })),
    dueForecast: dueForecast(cards, FORECAST_WINDOW, now).map((d) => ({
      label: d.label,
      count: d.count,
    })),
    cefr,
    decks: deckSummaries,
    strugglingWords,
  };
}
