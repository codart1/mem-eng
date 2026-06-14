import { Rating, State } from "ts-fsrs";
import type { ReviewLogEntry, VocabCard } from "@/lib/types";
import { startOfDay } from "@/lib/utils";

export function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * Consecutive-day study streak. Today not yet studied does NOT break the
 * streak (it counts back from yesterday); a gap of a full day does.
 */
export function currentStreak(
  logs: ReviewLogEntry[],
  now: Date = new Date(),
): number {
  if (logs.length === 0) return 0;
  const days = new Set(logs.map((l) => dayKey(l.reviewedAt)));
  const cursor = startOfDay(now);
  if (!days.has(dayKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (days.has(dayKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface DayCount {
  date: string;
  label: string;
  count: number;
}

/** Review counts for the last `days` days (oldest → newest), for charts. */
export function reviewsByDay(
  logs: ReviewLogEntry[],
  days: number,
  now: Date = new Date(),
): DayCount[] {
  const counts = new Map<string, number>();
  for (const l of logs) {
    const k = dayKey(l.reviewedAt);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const out: DayCount[] = [];
  const cursor = startOfDay(now);
  cursor.setDate(cursor.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const k = dayKey(cursor.getTime());
    out.push({
      date: k,
      label: cursor.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      count: counts.get(k) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

/** Proportion of mature (Review-state) reps that were recalled (not "Again"). */
export function retentionRate(logs: ReviewLogEntry[]): number {
  const reviews = logs.filter((l) => l.state === State.Review);
  if (reviews.length === 0) return 0;
  const passed = reviews.filter((l) => l.rating !== Rating.Again).length;
  return passed / reviews.length;
}

/** Number of cards becoming due on each of the next `days` days (day 0 = today, incl. overdue). */
export function dueForecast(
  cards: VocabCard[],
  days: number,
  now: Date = new Date(),
): DayCount[] {
  const start = startOfDay(now);
  const out: DayCount[] = [];
  for (let i = 0; i < days; i++) {
    const dayStart = new Date(start);
    dayStart.setDate(start.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    let count = 0;
    for (const c of cards) {
      if (c.fsrs.state === State.New) continue;
      const due = c.fsrs.due.getTime();
      if (i === 0 ? due < dayEnd.getTime() : due >= dayStart.getTime() && due < dayEnd.getTime()) {
        count += 1;
      }
    }
    out.push({
      date: dayKey(dayStart.getTime()),
      label:
        i === 0
          ? "Today"
          : dayStart.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
      count,
    });
  }
  return out;
}

export interface StateBreakdown {
  new: number;
  learning: number;
  review: number;
}

/** Count cards by maturity bucket (learning groups Learning + Relearning). */
export function stateBreakdown(cards: VocabCard[]): StateBreakdown {
  const b: StateBreakdown = { new: 0, learning: 0, review: 0 };
  for (const c of cards) {
    if (c.fsrs.state === State.New) b.new += 1;
    else if (c.fsrs.state === State.Review) b.review += 1;
    else b.learning += 1;
  }
  return b;
}
