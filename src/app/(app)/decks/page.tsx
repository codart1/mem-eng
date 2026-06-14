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

export default function DecksPage() {
  const stats = useDeckStats();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decks"
        description="Organize your vocabulary into focused collections."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New deck
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
          title="No decks yet"
          description="Create your first deck, then add words manually or with AI."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> Create a deck
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
