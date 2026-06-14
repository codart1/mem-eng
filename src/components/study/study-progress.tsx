"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

interface StudyProgressProps {
  done: number;
  total: number;
  remaining: number;
}

export function StudyProgress({ done, total, remaining }: StudyProgressProps) {
  const t = useT();
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t.study.endSession}
        render={<Link href="/dashboard" />}
      >
        <X className="size-4" />
      </Button>
      <Progress value={pct} className="h-2 flex-1" />
      <span className="text-muted-foreground text-sm tabular-nums">
        {t.study.left.replace("{count}", String(remaining))}
      </span>
    </div>
  );
}
