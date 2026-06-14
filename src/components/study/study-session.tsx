"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GraduationCap, Sparkles } from "lucide-react";
import { Flashcard } from "./flashcard";
import { RatingBar } from "./rating-bar";
import { StudyProgress } from "./study-progress";
import { SessionSummary, type SessionStats } from "./session-summary";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudyQueue, useSettings, useDecks } from "@/lib/hooks/use-data";
import {
  getScheduler,
  gradeCard,
  schedulingPreview,
  type RatingKey,
} from "@/lib/srs/scheduler";
import { repository } from "@/lib/db/dexie-repository";
import type { VocabCard } from "@/lib/types";
import { useT } from "@/lib/i18n";

const KEY_TO_RATING: Record<string, RatingKey> = {
  "1": "again",
  "2": "hard",
  "3": "good",
  "4": "easy",
};

export function StudySession({ deckId }: { deckId?: string }) {
  const t = useT();
  const { queue, loading } = useStudyQueue(deckId);
  const settings = useSettings();
  const decks = useDecks();

  const colorByDeck = useMemo(() => {
    const m = new Map<string, string>();
    decks?.forEach((d) => m.set(d.id, d.color));
    return m;
  }, [decks]);

  const [sessionCards, setSessionCards] = useState<VocabCard[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState<SessionStats>({
    reviewed: 0,
    again: 0,
    durationMs: 0,
  });
  const [finished, setFinished] = useState(false);
  const startRef = useRef(0);

  // Snapshot the queue once so it doesn't reshuffle mid-session.
  useEffect(() => {
    if (sessionCards === null && queue && !loading) {
      setSessionCards(queue.cards);
      startRef.current = Date.now();
    }
  }, [queue, loading, sessionCards]);

  const scheduler = useMemo(() => getScheduler(settings), [settings]);
  const current =
    sessionCards && index < sessionCards.length ? sessionCards[index] : null;
  const previews = useMemo(
    () => (current ? schedulingPreview(scheduler, current.fsrs) : []),
    [scheduler, current],
  );

  const handleRate = useCallback(
    (key: RatingKey) => {
      if (!current) return;
      const reviewedAt = new Date();
      const { card: nextFsrs, log } = gradeCard(
        scheduler,
        current.fsrs,
        key,
        reviewedAt,
      );
      void repository.cards
        .applyReview(current.id, nextFsrs, {
          ...log,
          cardId: current.id,
          deckId: current.deckId,
          reviewedAt: reviewedAt.getTime(),
        })
        .catch(console.error);

      setStats((s) => ({
        ...s,
        reviewed: s.reviewed + 1,
        again: s.again + (key === "again" ? 1 : 0),
      }));
      // Re-queue lapsed cards so they come back before the session ends.
      if (key === "again") {
        setSessionCards((prev) =>
          prev ? [...prev, { ...current, fsrs: nextFsrs }] : prev,
        );
      }
      setRevealed(false);
      setIndex((i) => i + 1);
    },
    [current, scheduler],
  );

  // Mark finished once we run past the end of the (possibly grown) queue.
  useEffect(() => {
    if (
      sessionCards &&
      sessionCards.length > 0 &&
      index >= sessionCards.length &&
      !finished
    ) {
      setStats((s) => ({ ...s, durationMs: Date.now() - startRef.current }));
      setFinished(true);
    }
  }, [index, sessionCards, finished]);

  // Keyboard controls: Space/Enter to reveal, 1–4 to rate.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (finished || !current) return;
      if (!revealed && (e.code === "Space" || e.key === "Enter")) {
        e.preventDefault();
        setRevealed(true);
        return;
      }
      if (revealed && KEY_TO_RATING[e.key]) {
        e.preventDefault();
        handleRate(KEY_TO_RATING[e.key]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, current, finished, handleRate]);

  function restart() {
    if (!queue) return;
    setSessionCards(queue.cards);
    setIndex(0);
    setRevealed(false);
    setStats({ reviewed: 0, again: 0, durationMs: 0 });
    setFinished(false);
    startRef.current = Date.now();
  }

  if (sessionCards === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-[420px] w-full rounded-3xl" />
      </div>
    );
  }

  if (sessionCards.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title={t.study.caughtUpTitle}
        description={t.study.caughtUpDescription}
        action={
          <div className="flex gap-2">
            <Button render={<Link href="/create" />}>
              <Sparkles className="size-4" /> {t.study.addWords}
            </Button>
            <Button variant="outline" render={<Link href="/dashboard" />}>
              {t.study.dashboard}
            </Button>
          </div>
        }
      />
    );
  }

  if (finished) {
    return (
      <SessionSummary
        stats={stats}
        onRestart={restart}
        canRestart={(queue?.counts.queued ?? 0) > 0}
      />
    );
  }

  const remaining = sessionCards.length - index;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <StudyProgress done={index} total={sessionCards.length} remaining={remaining} />

      {current && (
        <Flashcard
          key={`${current.id}-${index}`}
          card={current}
          revealed={revealed}
          onReveal={() => setRevealed(true)}
          deckColorKey={colorByDeck.get(current.deckId)}
        />
      )}

      <div className="min-h-[76px]">
        {revealed ? (
          <RatingBar previews={previews} onRate={handleRate} />
        ) : (
          <Button
            size="lg"
            className="h-12 w-full text-base"
            onClick={() => setRevealed(true)}
          >
            {t.study.showAnswer}
          </Button>
        )}
      </div>
    </div>
  );
}
