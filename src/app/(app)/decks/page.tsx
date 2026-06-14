"use client";

import { useState } from "react";
import { Plus, Layers } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeckCard } from "@/components/decks/deck-card";
import { DeckDialog } from "@/components/decks/deck-dialog";
import { useDeckStats } from "@/lib/hooks/use-data";
import { useT } from "@/lib/i18n";

export default function DecksPage() {
  const t = useT();
  const stats = useDeckStats();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.decks.title}
        description={t.decks.description}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> {t.decks.newDeck}
          </Button>
        }
      />

      {stats === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : stats.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={t.decks.emptyTitle}
          description={t.decks.emptyDescription}
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> {t.decks.createDeck}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <DeckCard key={stat.deck.id} stat={stat} />
          ))}
        </div>
      )}

      <DeckDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
