"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { ExternalLink, Sparkles, Loader2, Wand2, BookOpenText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TappableText } from "./tappable-text";
import { useSummarizeArticle } from "@/lib/hooks/use-summarize";
import type { NewsArticle } from "@/lib/news/types";
import { useT } from "@/lib/i18n";

interface Props {
  article: NewsArticle;
  onWord: (word: string) => void;
  savedWords: Set<string>;
}

export function ArticleCard({ article, onWord, savedWords }: Props) {
  const t = useT();
  const summarize = useSummarizeArticle();

  const simplified = summarize.data;
  const readHref = `/news/read?u=${encodeURIComponent(article.link)}`;

  return (
    <Card className="overflow-hidden">
      {article.image && (
        // Cancel the Card's top padding so the cover sits flush with the top
        // edge (the Card only auto-removes it for a *direct* <img> child).
        <Link href={readHref} className="-mt-(--card-spacing) block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image}
            alt=""
            referrerPolicy="no-referrer"
            loading="lazy"
            className="aspect-[16/7] w-full object-cover"
          />
        </Link>
      )}
      <CardContent className="space-y-3 py-5">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Badge variant="secondary" className="font-medium">
            {article.source}
          </Badge>
          <span>·</span>
          <span>
            {formatDistanceToNowStrict(article.publishedAt, { addSuffix: true })}
          </span>
        </div>

        <h3 className="font-serif text-lg leading-snug font-semibold tracking-tight">
          <TappableText
            text={article.title}
            onWord={onWord}
            savedWords={savedWords}
          />
        </h3>

        {article.summary && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            <TappableText
              text={article.summary}
              onWord={onWord}
              savedWords={savedWords}
            />
          </p>
        )}

        {summarize.isError && (
          <p className="text-destructive text-xs">{summarize.error.message}</p>
        )}

        {simplified && (
          <div className="bg-muted/50 space-y-2 rounded-lg p-3">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <Wand2 className="size-3.5" /> {t.news.simplifiedLabel}
            </div>
            <p className="text-sm leading-relaxed">
              <TappableText
                text={simplified.simplified}
                onWord={onWord}
                savedWords={savedWords}
              />
            </p>
            {simplified.vocabulary.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-muted-foreground text-xs">
                  {t.news.keyWords}
                </span>
                {simplified.vocabulary.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onWord(w)}
                    className="bg-brand/10 text-brand hover:bg-brand/20 rounded-md px-2 py-0.5 text-xs font-medium transition-colors"
                  >
                    + {w}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button size="sm" render={<Link href={readHref} />}>
            <BookOpenText className="size-4" /> {t.news.readArticle}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            disabled={summarize.isPending}
            onClick={() =>
              summarize.mutate({ title: article.title, summary: article.summary })
            }
          >
            {summarize.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {t.news.simplify}
          </Button>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground ml-auto inline-flex items-center gap-1 text-xs font-medium transition-colors"
          >
            {t.news.openOriginal} <ExternalLink className="size-3.5" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
