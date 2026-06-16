"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TappableText } from "@/components/vocab/tappable-text";
import { WordAddSheet } from "@/components/vocab/word-add-sheet";
import { SelectionVocab } from "@/components/vocab/selection-vocab";
import { useArticle } from "@/lib/hooks/use-article";
import { useDecks, useAllCards } from "@/lib/hooks/use-data";
import type { ArticleBlock } from "@/lib/news/types";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function ArticleReader({ url }: { url: string }) {
  const t = useT();
  const { data, isLoading, isError, error } = useArticle(url);
  const decks = useDecks();
  const cards = useAllCards();

  useEffect(() => {
    if (isError && error) {
      console.error("[ArticleReader] Error loading article:", error);
    }
  }, [isError, error]);

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [deckId, setDeckId] = useState("");

  const savedWords = useMemo(
    () => new Set((cards ?? []).map((c) => c.word.toLowerCase())),
    [cards],
  );

  const effectiveDeckId =
    deckId && decks?.some((d) => d.id === deckId) ? deckId : (decks?.[0]?.id ?? "");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/news" />}>
          <ArrowLeft className="size-4" /> {t.news.backToNews}
        </Button>
        {data && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors"
          >
            {t.news.openOriginal} <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>

      {isLoading && <ReaderSkeleton />}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="space-y-2">
            <p>{error.message}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
            >
              {t.news.openOriginal} <ExternalLink className="size-3.5" />
            </a>
          </AlertDescription>
        </Alert>
      )}

      {data && (
        <article className="space-y-5">
          {data.leadImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.leadImage}
              alt=""
              referrerPolicy="no-referrer"
              className="aspect-video w-full rounded-xl object-cover"
            />
          )}

          <header className="space-y-2">
            <h1 className="font-serif text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
              <TappableText
                text={data.title}
                onWord={setSelectedWord}
                savedWords={savedWords}
              />
            </h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              {data.siteName && <span className="font-medium">{data.siteName}</span>}
              {data.byline && (
                <>
                  <span>·</span>
                  <span>{data.byline}</span>
                </>
              )}
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {t.news.readMinutes.replace("{min}", String(data.readingMinutes))}
              </span>
            </div>
          </header>

          <div className="space-y-4">
            {data.blocks.map((block, i) => (
              <BlockView
                key={i}
                block={block}
                onWord={setSelectedWord}
                savedWords={savedWords}
              />
            ))}
          </div>

          <p className="text-muted-foreground border-t pt-4 text-xs">
            {t.news.readerDisclaimer.replace("{source}", data.siteName ?? "")}
          </p>
        </article>
      )}

      <SelectionVocab onSelect={setSelectedWord} />

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

function BlockView({
  block,
  onWord,
  savedWords,
}: {
  block: ArticleBlock;
  onWord: (w: string) => void;
  savedWords: Set<string>;
}) {
  const tap = (text: string, className?: string) => (
    <TappableText
      text={text}
      onWord={onWord}
      savedWords={savedWords}
      className={className}
    />
  );

  switch (block.type) {
    case "heading":
      return (
        <h2
          className={cn(
            "font-serif font-semibold tracking-tight",
            block.level === 2 ? "text-xl" : "text-lg",
          )}
        >
          {tap(block.text)}
        </h2>
      );
    case "paragraph":
      return <p className="leading-relaxed">{tap(block.text)}</p>;
    case "quote":
      return (
        <blockquote className="border-brand text-muted-foreground border-l-2 pl-4 text-lg italic">
          {tap(block.text)}
        </blockquote>
      );
    case "list":
      return (
        <ul
          className={cn(
            "ml-5 space-y-1.5",
            block.ordered ? "list-decimal" : "list-disc",
          )}
        >
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {tap(item)}
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <figure className="space-y-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt ?? ""}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full rounded-lg"
          />
          {block.caption && (
            <figcaption className="text-muted-foreground text-center text-xs">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
  }
}

function ReaderSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-4 w-40" />
      <div className="space-y-3 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
