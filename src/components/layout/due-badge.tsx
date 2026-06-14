"use client";

import { cn } from "@/lib/utils";
import { useDueSummary } from "@/lib/hooks/use-data";

export function DueBadge({ compact = false }: { compact?: boolean }) {
  const counts = useDueSummary();
  const total = counts?.queued ?? 0;
  if (total <= 0) return null;

  if (compact) {
    return (
      <span className="bg-brand text-brand-foreground grid min-w-4 place-items-center rounded-full px-1 text-[9px] leading-4 font-semibold tabular-nums">
        {total > 99 ? "99+" : total}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "bg-brand/15 text-brand inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
      )}
    >
      {total > 999 ? "999+" : total}
    </span>
  );
}
