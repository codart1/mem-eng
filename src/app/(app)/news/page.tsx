"use client";

import { useMemo, useState } from "react";
import { Newspaper, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ArticleCard } from "@/components/news/article-card";
import { WordAddSheet } from "@/components/news/word-add-sheet";
import { useNews } from "@/lib/hooks/use-news";
import { useDecks, useAllCards } from "@/lib/hooks/use-data";
import { NEWS_CATEGORIES } from "@/lib/news/types";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const FILTERS = ["all", ...NEWS_CATEGORIES] as const;
type Filter = (typeof FILTERS)[number];

export default function NewsPage() {
  const t = useT();
  const { data, isLoading, isError, refetch, isRefetching } = useNews();
  const decks = useDecks();
  const cards = useAllCards();

  const [filter, setFilter] = useState<Filter>("all");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [deckId, setDeckId] = useState("");

  // Words already in the user's collection, lowercased for highlight matching.
  const savedWords = useMemo(
    () => new Set((cards ?? []).map((c) => c.word.toLowerCase())),
    [cards],
  );

  const articles = useMemo(() => {
    const all = data?.articles ?? [];
    return filter === "all" ? all : all.filter((a) => a.category === filter);
  }, [data, filter]);

  // Keep the deck picker pointed at a real deck once decks load.
  const effectiveDeckId =
    deckId && decks?.some((d) => d.id === deckId) ? deckId : (decks?.[0]?.id ?? "");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <PageHeader title={t.news.title} description={t.news.description} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          aria-label={t.news.refresh}
        >
          <RefreshCw className={cn("size-4", isRefetching && "animate-spin")} />
          <span className="hidden sm:inline">{t.news.refresh}</span>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              filter === f
                ? "border-brand bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {t.news.categories[f]}
          </button>
        ))}
      </div>

      <p className="text-muted-foreground text-xs">{t.news.tapHint}</p>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>{t.news.loadError}</AlertDescription>
        </Alert>
      )}

      {data && articles.length === 0 && !isLoading && (
        <EmptyState
          icon={Newspaper}
          title={t.news.emptyTitle}
          description={t.news.emptyDescription}
        />
      )}

      {articles.length > 0 && (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onWord={setSelectedWord}
              savedWords={savedWords}
            />
          ))}
        </div>
      )}

      <WordAddSheet
        word={selectedWord}
        onOpenChange={(open) => !open && setSelectedWord(null)}
        decks={decks ?? []}
        deckId={effectiveDeckId}
        onDeckIdChange={setDeckId}
        onAdded={() => setSelectedWord(null)}
      />
    </div>
  );
}
