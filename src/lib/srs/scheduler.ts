import {
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Grade,
  type FSRS,
  type FSRSParameters,
  type Card as FsrsCard,
  type RecordLogItem,
} from "ts-fsrs";
import type { AppSettings } from "@/lib/types";

export type RatingKey = "again" | "hard" | "good" | "easy";

export const RATING_KEYS: RatingKey[] = ["again", "hard", "good", "easy"];

export const GRADE_BY_KEY: Record<RatingKey, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

export const RATING_LABEL: Record<RatingKey, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

export function buildParams(settings: AppSettings): FSRSParameters {
  return generatorParameters({
    request_retention: settings.requestRetention,
    maximum_interval: settings.maximumInterval,
    enable_fuzz: settings.enableFuzz,
  });
}

export function getScheduler(settings: AppSettings): FSRS {
  return fsrs(buildParams(settings));
}

export function gradeCard(
  scheduler: FSRS,
  card: FsrsCard,
  key: RatingKey,
  reviewedAt: Date = new Date(),
): RecordLogItem {
  return scheduler.next(card, reviewedAt, GRADE_BY_KEY[key]);
}

export interface RatingPreview {
  key: RatingKey;
  card: FsrsCard;
  intervalMs: number;
  intervalLabel: string;
}

/** Preview the next interval for all four ratings (Anki-style buttons). */
export function schedulingPreview(
  scheduler: FSRS,
  card: FsrsCard,
  nowDate: Date = new Date(),
): RatingPreview[] {
  const preview = scheduler.repeat(card, nowDate);
  return RATING_KEYS.map((key) => {
    const next = preview[GRADE_BY_KEY[key]].card;
    const intervalMs = next.due.getTime() - nowDate.getTime();
    return {
      key,
      card: next,
      intervalMs,
      intervalLabel: formatInterval(intervalMs),
    };
  });
}

export function isNew(card: FsrsCard): boolean {
  return card.state === State.New;
}

export function isDue(card: FsrsCard, nowDate: Date = new Date()): boolean {
  return card.due.getTime() <= nowDate.getTime();
}

export function retrievability(
  scheduler: FSRS,
  card: FsrsCard,
  nowDate: Date = new Date(),
): number {
  if (card.state === State.New) return 0;
  return scheduler.get_retrievability(card, nowDate, false);
}

/** Human-friendly interval label, e.g. "10m", "1d", "3mo", "2y". */
export function formatInterval(ms: number): string {
  const min = ms / 60000;
  if (min < 1) return "<1m";
  if (min < 60) return `${Math.round(min)}m`;
  const hours = min / 60;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)}d`;
  const months = days / 30;
  if (months < 12) return `${Math.round(months)}mo`;
  return `${(days / 365).toFixed(days / 365 < 10 ? 1 : 0)}y`;
}

export { Rating, State };
