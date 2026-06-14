"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Flame,
  Sparkles,
  Clock,
  TrendingUp,
  Layers,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { DeckCard } from "@/components/decks/deck-card";
import {
  useStudyQueue,
  useAllCards,
  useAllLogs,
  useDeckStats,
} from "@/lib/hooks/use-data";
import { currentStreak, retentionRate } from "@/lib/stats";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

function greeting(d: Dictionary["dashboard"]) {
  const h = new Date().getHours();
  if (h < 12) return d.greetingMorning;
  if (h < 18) return d.greetingAfternoon;
  return d.greetingEvening;
}

export default function DashboardPage() {
  const d = useT().dashboard;
  const { queue } = useStudyQueue();
  const cards = useAllCards();
  const logs = useAllLogs();
  const deckStats = useDeckStats();

  const streak = useMemo(() => (logs ? currentStreak(logs) : 0), [logs]);
  const retention = useMemo(() => (logs ? retentionRate(logs) : 0), [logs]);

  const queued = queue?.counts.queued ?? 0;
  const due = queue?.counts.due ?? 0;
  const newCount = queue?.counts.new ?? 0;
  const total = cards?.length ?? 0;

  if (deckStats !== undefined && deckStats.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title={d.welcomeTitle}
        description={d.welcomeDescription}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button render={<Link href="/create" />}>
              <Sparkles className="size-4" /> {d.generateWithAi}
            </Button>
            <Button variant="outline" render={<Link href="/decks" />}>
              <Plus className="size-4" /> {d.createDeck}
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-7">
      {/* Hero */}
      <Card className="aurora-glow overflow-hidden border-0 p-0 shadow-sm">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-sm">{greeting(d)} 👋</p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">
              {queued > 0
                ? `${queued} ${queued === 1 ? d.readyOne : d.readyMany}`
                : d.caughtUp}
            </h1>
            <p className="text-muted-foreground text-sm">
              {queued > 0 ? d.subReady : d.subCaughtUp}
            </p>
          </div>
          <Button
            size="lg"
            className="h-12 px-6 text-base shadow-sm"
            disabled={queued === 0}
            render={<Link href="/study" />}
          >
            <GraduationCap className="size-5" />
            {queued > 0 ? d.studyNow : d.nothingDue}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      {queue === undefined || logs === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={d.dueToday}
            value={due}
            icon={Clock}
            accent="var(--rating-good)"
          />
          <StatCard
            label={d.newAvailable}
            value={newCount}
            icon={Sparkles}
            accent="var(--brand)"
          />
          <StatCard
            label={d.dayStreak}
            value={streak}
            icon={Flame}
            accent="var(--amber)"
            hint={streak > 0 ? d.keepGoing : d.startStreak}
          />
          <StatCard
            label={d.retention}
            value={`${Math.round(retention * 100)}%`}
            icon={TrendingUp}
            accent="var(--rating-easy)"
          />
        </div>
      )}

      {/* Decks */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">{d.yourDecks}</h2>
          <Button variant="ghost" size="sm" render={<Link href="/decks" />}>
            <Layers className="size-4" /> {d.allDecks}
          </Button>
        </div>
        {deckStats === undefined ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deckStats.slice(0, 6).map((stat) => (
              <DeckCard key={stat.deck.id} stat={stat} />
            ))}
          </div>
        )}
      </section>

      <p className="text-muted-foreground/70 text-center text-xs">
        {total} {d.cardsOffline}
      </p>
    </div>
  );
}
