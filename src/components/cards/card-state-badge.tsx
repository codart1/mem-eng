"use client";

import { State } from "ts-fsrs";
import { formatDistanceToNowStrict } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { VocabCard } from "@/lib/types";

const STATE_META: Record<State, { label: string; color: string }> = {
  [State.New]: { label: "New", color: "var(--brand)" },
  [State.Learning]: { label: "Learning", color: "var(--rating-hard)" },
  [State.Relearning]: { label: "Relearning", color: "var(--rating-again)" },
  [State.Review]: { label: "Review", color: "var(--rating-good)" },
};

export function CardStateBadge({ card }: { card: VocabCard }) {
  const meta = STATE_META[card.fsrs.state];
  const due = card.fsrs.due;
  const isDue = card.fsrs.state !== State.New && due.getTime() <= Date.now();

  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge
        variant="outline"
        style={{
          color: meta.color,
          borderColor: `color-mix(in oklch, ${meta.color} 35%, transparent)`,
          backgroundColor: `color-mix(in oklch, ${meta.color} 10%, transparent)`,
        }}
      >
        {meta.label}
      </Badge>
      {card.fsrs.state !== State.New && (
        <span className="text-muted-foreground text-xs">
          {isDue ? "due now" : `in ${formatDistanceToNowStrict(due)}`}
        </span>
      )}
    </span>
  );
}
