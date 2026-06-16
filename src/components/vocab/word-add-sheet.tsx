"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpeakButton } from "@/components/speak-button";
import { repository } from "@/lib/db/dexie-repository";
import { generatedWordToCardInput } from "@/lib/ai/schema";
import { useDefineWord } from "@/lib/hooks/use-define";
import type { Deck } from "@/lib/types";
import { useT } from "@/lib/i18n";

interface Props {
  /** The tapped headword, or null when the sheet is closed. */
  word: string | null;
  onOpenChange: (open: boolean) => void;
  decks: Deck[];
  deckId: string;
  onDeckIdChange: (id: string) => void;
  /** Called after a card is saved, with the lowercased headword. */
  onAdded: (word: string) => void;
  /** Override the sheet subtitle for context (news vs. a book). */
  subtitle?: string;
}

export function WordAddSheet({
  word,
  onOpenChange,
  decks,
  deckId,
  onDeckIdChange,
  onAdded,
  subtitle,
}: Props) {
  const t = useT();
  const define = useDefineWord();
  const [adding, setAdding] = useState(false);

  // Look up the word whenever a new one is tapped.
  useEffect(() => {
    if (word) {
      define.reset();
      define.mutate({ word });
    }
    // Only re-run when the selected word changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  const result = define.data;
  const noDecks = decks.length === 0;

  async function handleAdd() {
    if (!result || !deckId) {
      toast.error(t.vocab.pickDeck);
      return;
    }
    setAdding(true);
    try {
      const headword = result.word.word;
      await repository.cards.create(generatedWordToCardInput(result.word, deckId));
      toast.success(t.vocab.addedToast.replace("{word}", headword), {
        description: decks.find((d) => d.id === deckId)?.name,
      });
      onAdded(headword.toLowerCase());
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(t.vocab.addError);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Sheet open={word !== null} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[85dvh] gap-0 overflow-y-auto sm:max-w-lg sm:rounded-t-xl">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2 font-serif text-xl">
            {word}
            {word && <SpeakButton text={result?.word.word ?? word} />}
          </SheetTitle>
          <SheetDescription>{subtitle ?? t.vocab.addSheetSubtitle}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          {define.isPending && (
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}

          {define.isError && (
            <Alert variant="destructive">
              <AlertDescription>{define.error.message}</AlertDescription>
            </Alert>
          )}

          {result && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {result.word.phonetic && (
                  <span className="text-muted-foreground font-mono text-sm">
                    {result.word.phonetic}
                  </span>
                )}
                {result.word.cefr && (
                  <Badge variant="secondary">{result.word.cefr}</Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  {result.source === "ai" ? (
                    <Sparkles className="size-3" />
                  ) : (
                    <BookOpen className="size-3" />
                  )}
                  {result.source === "ai" ? t.vocab.sourceAi : t.vocab.sourceDict}
                </Badge>
              </div>

              {result.word.senses.map((sense, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-muted-foreground text-xs italic">
                    {sense.partOfSpeech}
                  </span>
                  <p className="text-sm leading-relaxed">{sense.definition}</p>
                  {sense.examples.slice(0, 1).map((ex, j) => (
                    <p
                      key={j}
                      className="text-muted-foreground border-brand border-l-2 pl-3 text-sm italic"
                    >
                      “{ex}”
                    </p>
                  ))}
                </div>
              ))}

              {result.source === "dictionary" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  disabled={define.isPending}
                  onClick={() => word && define.mutate({ word, preferAi: true })}
                >
                  <Sparkles className="size-4" /> {t.vocab.richerWithAi}
                </Button>
              )}
            </>
          )}

          {noDecks ? (
            <Alert>
              <AlertTitle>{t.vocab.noDeckTitle}</AlertTitle>
              <AlertDescription>{t.vocab.noDeckDescription}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center">
              <Select
                value={deckId}
                onValueChange={(v) => onDeckIdChange(v as string)}
              >
                <SelectTrigger className="sm:w-52">
                  {/* Render the name explicitly: Base UI's Value only learns an
                      item's label once the (portaled) list has mounted. */}
                  <SelectValue placeholder={t.vocab.chooseDeck}>
                    {decks.find((d) => d.id === deckId)?.name ?? t.vocab.chooseDeck}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {decks.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAdd}
                disabled={adding || !result}
                className="sm:ml-auto"
              >
                {adding ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                {t.vocab.addToDeck}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
