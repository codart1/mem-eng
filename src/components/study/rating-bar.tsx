"use client";

import { cn } from "@/lib/utils";
import { RATING_LABEL, type RatingKey, type RatingPreview } from "@/lib/srs/scheduler";

const RATING_VAR: Record<RatingKey, string> = {
  again: "var(--rating-again)",
  hard: "var(--rating-hard)",
  good: "var(--rating-good)",
  easy: "var(--rating-easy)",
};

const SHORTCUT: Record<RatingKey, string> = {
  again: "1",
  hard: "2",
  good: "3",
  easy: "4",
};

interface RatingBarProps {
  previews: RatingPreview[];
  onRate: (key: RatingKey) => void;
}

export function RatingBar({ previews, onRate }: RatingBarProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {previews.map((p) => {
        const color = RATING_VAR[p.key];
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => onRate(p.key)}
            className={cn(
              "group relative flex flex-col items-center gap-0.5 rounded-xl border px-2 py-3 transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:outline-none",
            )}
            style={{
              borderColor: `color-mix(in oklch, ${color} 40%, transparent)`,
              backgroundColor: `color-mix(in oklch, ${color} 8%, transparent)`,
              color,
            }}
          >
            <span className="text-sm font-semibold">{RATING_LABEL[p.key]}</span>
            <span className="font-mono text-xs tabular-nums opacity-90">
              {p.intervalLabel}
            </span>
            <kbd className="text-muted-foreground absolute top-1.5 right-2 hidden text-[10px] sm:block">
              {SHORTCUT[p.key]}
            </kbd>
          </button>
        );
      })}
    </div>
  );
}
