"use client";

import { useState } from "react";
import { Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardDialog } from "@/components/cards/card-dialog";
import { DeckDialog } from "@/components/decks/deck-dialog";
import { useDecks } from "@/lib/hooks/use-data";
import { useT } from "@/lib/i18n";

export function ManualCreatePanel() {
  const t = useT();
  const decks = useDecks();
  const [deckId, setDeckId] = useState<string>("");
  const [cardOpen, setCardOpen] = useState(false);
  const [deckOpen, setDeckOpen] = useState(false);

  if (decks && decks.length === 0) {
    return (
      <Alert>
        <Layers className="size-4" />
        <AlertTitle>{t.manualCreate.noDeckTitle}</AlertTitle>
        <AlertDescription>
          {t.manualCreate.noDeckDescription}
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-fit"
            onClick={() => setDeckOpen(true)}
          >
            <Plus className="size-4" /> {t.manualCreate.newDeck}
          </Button>
        </AlertDescription>
        <DeckDialog
          open={deckOpen}
          onOpenChange={setDeckOpen}
          onSaved={(d) => setDeckId(d.id)}
        />
      </Alert>
    );
  }

  const effectiveDeck = deckId || decks?.[0]?.id || "";

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label>{t.manualCreate.deck}</Label>
        <Select value={effectiveDeck} onValueChange={(v) => setDeckId(v as string)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t.manualCreate.chooseDeck} />
          </SelectTrigger>
          <SelectContent>
            {decks?.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={() => setCardOpen(true)} disabled={!effectiveDeck}>
        <Plus className="size-4" /> {t.manualCreate.newCard}
      </Button>

      {effectiveDeck && (
        <CardDialog
          open={cardOpen}
          onOpenChange={setCardOpen}
          deckId={effectiveDeck}
        />
      )}
    </div>
  );
}
