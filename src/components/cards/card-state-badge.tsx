"use client";

import { State } from "ts-fsrs";
import { formatDistanceToNowStrict } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { VocabCard } from "@/lib/types";
import { useT } from "@/lib/i18n";

const STATE_COLOR: Record<State, string> = {
  [State.New]: "var(--brand)",
  [State.Learning]: "var(--rating-hard)",
  [State.Relearning]: "var(--rating-again)",
  [State.Review]: "var(--rating-good)",
};

export function CardStateBadge({ card }: { card: VocabCard }) {
  const t = useT();
  const stateLabel: Record<State, string> = {
    [State.New]: t.cardState.new,
    [State.Learning]: t.cardState.learning,
    [State.Relearning]: t.cardState.relearning,
    [State.Review]: t.cardState.review,
  };
  const meta = { label: stateLabel[card.fsrs.state], color: STATE_COLOR[card.fsrs.state] };
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
          {isDue
            ? t.cardState.dueNow
            : t.cardState.inTime.replace("{time}", formatDistanceToNowStrict(due))}
        </span>
      )}
    </span>
  );
}
