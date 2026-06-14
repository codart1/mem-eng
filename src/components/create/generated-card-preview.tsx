"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { repository } from "@/lib/db/dexie-repository";
import { generatedWordToCardInput } from "@/lib/ai/schema";
import type { Deck, GeneratedWord } from "@/lib/types";
import { useT } from "@/lib/i18n";

interface Props {
  word: GeneratedWord;
  decks: Deck[];
  defaultDeckId?: string;
  onAdded: () => void;
}

export function GeneratedCardPreview({
  word,
  decks,
  defaultDeckId,
  onAdded,
}: Props) {
  const t = useT();
  const [deckId, setDeckId] = useState(defaultDeckId ?? decks[0]?.id ?? "");
  const [editedWord, setEditedWord] = useState(word.word);
  const [editedDef, setEditedDef] = useState(word.senses[0]?.definition ?? "");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!deckId) {
      toast.error(t.genPreview.pickDeck);
      return;
    }
    setAdding(true);
    try {
      await repository.cards.create(
        generatedWordToCardInput(word, deckId, {
          word: editedWord,
          definition: editedDef,
        }),
      );
      toast.success(t.genPreview.addedToast.replace("{word}", editedWord), {
        description: decks.find((d) => d.id === deckId)?.name,
      });
      onAdded();
    } catch (err) {
      console.error(err);
      toast.error(t.genPreview.addError);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-5 py-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={editedWord}
              onChange={(e) => setEditedWord(e.target.value)}
              className="font-serif h-auto max-w-[16rem] py-1 text-2xl font-semibold"
            />
            {word.phonetic && (
              <span className="text-muted-foreground font-mono text-sm">
                {word.phonetic}
              </span>
            )}
            {word.cefr && <Badge variant="secondary">{word.cefr}</Badge>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gen-def" className="text-muted-foreground text-xs">
              {word.senses[0]?.partOfSpeech}
            </Label>
            <Textarea
              id="gen-def"
              value={editedDef}
              onChange={(e) => setEditedDef(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {word.senses[0]?.examples.length > 0 && (
          <div className="space-y-1">
            {word.senses[0].examples.map((ex, i) => (
              <p
                key={i}
                className="text-muted-foreground border-brand border-l-2 pl-3 text-sm italic"
              >
                “{ex}”
              </p>
            ))}
          </div>
        )}

        {word.senses.length > 1 && (
          <div className="text-muted-foreground space-y-1 text-sm">
            <span className="text-xs font-medium">{t.genPreview.otherSenses}</span>
            {word.senses.slice(1).map((s, i) => (
              <p key={i}>
                <span className="italic">{s.partOfSpeech}</span> — {s.definition}
              </p>
            ))}
          </div>
        )}

        {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
          <div className="flex flex-wrap gap-4 text-sm">
            {word.synonyms.length > 0 && (
              <div>
                <span className="text-muted-foreground text-xs">{t.common.synonyms}</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {word.synonyms.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {word.antonyms.length > 0 && (
              <div>
                <span className="text-muted-foreground text-xs">{t.common.antonyms}</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {word.antonyms.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {word.mnemonic && (
          <div className="bg-amber/10 rounded-lg px-3 py-2 text-sm">
            💡 {word.mnemonic}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center">
          <Select value={deckId} onValueChange={(v) => setDeckId(v as string)}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder={t.genPreview.chooseDeck} />
            </SelectTrigger>
            <SelectContent>
              {decks.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={adding} className="sm:ml-auto">
            {adding ? (
              <>
                <Check className="size-4" /> {t.genPreview.added}
              </>
            ) : (
              <>
                <Plus className="size-4" /> {t.genPreview.add}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
