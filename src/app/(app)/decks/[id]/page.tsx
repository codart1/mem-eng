"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  GraduationCap,
  Pencil,
  ArrowLeft,
  Search,
  BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CardList } from "@/components/cards/card-list";
import { CardDialog } from "@/components/cards/card-dialog";
import { DeckDialog } from "@/components/decks/deck-dialog";
import { useDeck, useCardsByDeck } from "@/lib/hooks/use-data";
import { deckColor } from "@/lib/deck-color";
import { useT } from "@/lib/i18n";

export default function DeckDetailPage() {
  const t = useT();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const deck = useDeck(id);
  const cards = useCardsByDeck(id);

  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!cards) return undefined;
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.word.toLowerCase().includes(q) ||
        c.definition.toLowerCase().includes(q),
    );
  }, [cards, query]);

  if (deck === undefined && cards === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!deck) {
    return (
      <EmptyState
        icon={BookOpen}
        title={t.deckDetail.notFoundTitle}
        description={t.deckDetail.notFoundDescription}
        action={
          <Button render={<Link href="/decks" />}>
            <ArrowLeft className="size-4" /> {t.deckDetail.backToDecks}
          </Button>
        }
      />
    );
  }

  const total = cards?.length ?? 0;

  return (
    <div className="space-y-6">
      <Link
        href="/decks"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> {t.deckDetail.decks}
      </Link>

      <PageHeader
        title={deck.name}
        description={deck.description}
        actions={
          <>
            <Button variant="outline" size="icon" aria-label={t.deckDetail.editDeck} onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" /> {t.deckDetail.addCard}
            </Button>
            <Button
              disabled={total === 0}
              onClick={() => router.push(`/study/${deck.id}`)}
            >
              <GraduationCap className="size-4" /> {t.deckDetail.study}
            </Button>
          </>
        }
      />

      <div
        aria-hidden
        className="h-1 w-full rounded-full"
        style={{ backgroundColor: deckColor(deck.color) }}
      />

      {total === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t.deckDetail.emptyTitle}
          description={t.deckDetail.emptyDescription}
          action={
            <div className="flex gap-2">
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="size-4" /> {t.deckDetail.addManually}
              </Button>
              <Button variant="outline" render={<Link href="/create" />}>
                {t.deckDetail.useAi}
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.deckDetail.search.replace("{count}", String(total))}
              className="pl-9"
            />
          </div>
          {filtered && filtered.length > 0 ? (
            <CardList cards={filtered} />
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {t.deckDetail.noMatch.replace("{query}", query)}
            </p>
          )}
        </div>
      )}

      <CardDialog open={addOpen} onOpenChange={setAddOpen} deckId={deck.id} />
      <DeckDialog open={editOpen} onOpenChange={setEditOpen} deck={deck} />
    </div>
  );
}
