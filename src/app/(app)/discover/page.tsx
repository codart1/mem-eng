"use client";

import { useState } from "react";
import { Check, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { repository } from "@/lib/db/dexie-repository";
import { useWordSets } from "@/lib/hooks/use-word-sets";
import type { FeaturedWordSet } from "@/lib/word-sets/data";
import { deckColor } from "@/lib/deck-color";
import { useT } from "@/lib/i18n";

export default function DiscoverPage() {
  const t = useT();
  const { data: sets, isLoading, isError } = useWordSets();

  return (
    <div className="space-y-6">
      <PageHeader title={t.discover.title} description={t.discover.description} />

      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>{t.discover.loadError}</AlertDescription>
        </Alert>
      )}

      {sets && sets.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title={t.discover.emptyTitle}
          description={t.discover.emptyDescription}
        />
      )}

      {sets && sets.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          {sets.map((set) => (
            <WordSetCard key={set.id} set={set} />
          ))}
        </div>
      )}
    </div>
  );
}

function WordSetCard({ set }: { set: FeaturedWordSet }) {
  const t = useT();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const accent = deckColor(set.color);

  async function handleAdd() {
    setAdding(true);
    try {
      const deck = await repository.decks.create({
        name: set.title,
        description: set.description,
        color: set.color,
      });
      await repository.cards.createMany(
        set.words.map((e) => ({
          deckId: deck.id,
          word: e.word,
          definition: e.definition,
          phonetic: e.phonetic,
          partOfSpeech: e.partOfSpeech,
          examples: e.examples ?? [],
          synonyms: e.synonyms ?? [],
          antonyms: e.antonyms ?? [],
          cefr: e.cefr,
          mnemonic: e.mnemonic,
          source: "manual",
        })),
      );
      setAdded(true);
      toast.success(t.discover.addedToast.replace("{title}", set.title), {
        description: t.discover.words.replace("{count}", String(set.words.length)),
      });
    } catch (err) {
      console.error(err);
      toast.error(t.discover.addError);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden" style={{ borderTopWidth: 3, borderTopColor: accent }}>
      <CardContent className="flex flex-1 flex-col gap-4 py-5">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-semibold tracking-tight">
              {set.title}
            </h3>
            <Badge variant="secondary" className="shrink-0">
              {set.level}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {set.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {set.words.slice(0, 5).map((w) => (
            <span
              key={w.word}
              className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs font-medium"
            >
              {w.word}
            </span>
          ))}
          {set.words.length > 5 && (
            <span className="text-muted-foreground px-1 py-0.5 text-xs">
              +{set.words.length - 5}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
          <span className="text-muted-foreground text-sm">
            {t.discover.words.replace("{count}", String(set.words.length))}
          </span>
          <Button onClick={handleAdd} disabled={adding || added} size="sm">
            {added ? (
              <>
                <Check className="size-4" /> {t.discover.added}
              </>
            ) : (
              <>
                <Plus className="size-4" /> {t.discover.add}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
