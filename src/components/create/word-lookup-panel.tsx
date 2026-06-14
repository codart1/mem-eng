"use client";

import { useRef, useState } from "react";
import { Sparkles, Loader2, Layers, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { GeneratedCardPreview } from "./generated-card-preview";
import { DeckDialog } from "@/components/decks/deck-dialog";
import { useDecks } from "@/lib/hooks/use-data";
import { useGenerateWord } from "@/lib/hooks/use-generate";

export function WordLookupPanel() {
  const decks = useDecks();
  const generate = useGenerateWord();
  const [term, setTerm] = useState("");
  const [lastDeckId, setLastDeckId] = useState<string>();
  const [createDeckOpen, setCreateDeckOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const noDecks = decks !== undefined && decks.length === 0;

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const w = term.trim();
    if (!w || generate.isPending) return;
    generate.mutate(w);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="flex gap-2">
        <div className="relative flex-1">
          <Sparkles className="text-brand absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Type any English word — e.g. “serendipity”"
            className="h-11 pl-9 text-base"
            autoFocus
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-11"
          disabled={generate.isPending || !term.trim()}
        >
          {generate.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Generate
        </Button>
      </form>

      {noDecks && (
        <Alert>
          <Layers className="size-4" />
          <AlertTitle>Create a deck to save words</AlertTitle>
          <AlertDescription>
            You&apos;ll need at least one deck before adding cards.
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-fit"
              onClick={() => setCreateDeckOpen(true)}
            >
              <Plus className="size-4" /> New deck
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {generate.isError && (
        <Alert variant="destructive">
          <AlertDescription>{generate.error.message}</AlertDescription>
        </Alert>
      )}

      {generate.isPending && <Skeleton className="h-72 w-full rounded-xl" />}

      {generate.isSuccess && generate.data && decks && decks.length > 0 && (
        <GeneratedCardPreview
          key={generate.data.word}
          word={generate.data}
          decks={decks}
          defaultDeckId={lastDeckId}
          onAdded={() => {
            generate.reset();
            setTerm("");
            inputRef.current?.focus();
          }}
        />
      )}

      <DeckDialog
        open={createDeckOpen}
        onOpenChange={setCreateDeckOpen}
        onSaved={(deck) => setLastDeckId(deck.id)}
      />
    </div>
  );
}
