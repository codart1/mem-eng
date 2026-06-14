"use client";

import Link from "next/link";
import { PartyPopper, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export interface SessionStats {
  reviewed: number;
  again: number;
  durationMs: number;
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

export function SessionSummary({
  stats,
  onRestart,
  canRestart,
}: {
  stats: SessionStats;
  onRestart?: () => void;
  canRestart?: boolean;
}) {
  const t = useT();
  const passed = stats.reviewed - stats.again;
  const accuracy =
    stats.reviewed > 0 ? Math.round((passed / stats.reviewed) * 100) : 0;

  return (
    <div className="mx-auto max-w-md">
      <Card className="overflow-hidden text-center">
        <div className="aurora-glow flex flex-col items-center gap-2 px-6 pt-10 pb-6">
          <div className="bg-brand text-brand-foreground grid size-16 place-items-center rounded-2xl shadow-sm">
            <PartyPopper className="size-8" />
          </div>
          <h2 className="mt-2 font-serif text-2xl font-semibold">
            {t.sessionSummary.complete}
          </h2>
          <p className="text-muted-foreground text-sm">{t.sessionSummary.niceWork}</p>
        </div>
        <CardContent className="grid grid-cols-3 gap-3 py-6">
          <Stat label={t.sessionSummary.reviewed} value={stats.reviewed} />
          <Stat label={t.sessionSummary.accuracy} value={`${accuracy}%`} />
          <Stat label={t.sessionSummary.time} value={formatDuration(stats.durationMs)} />
        </CardContent>
        <div className="flex gap-2 px-6 pb-6">
          {canRestart && onRestart && (
            <Button variant="outline" className="flex-1" onClick={onRestart}>
              <RotateCcw className="size-4" /> {t.sessionSummary.keepGoing}
            </Button>
          )}
          <Button className="flex-1" render={<Link href="/dashboard" />}>
            {t.sessionSummary.done}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  );
}
