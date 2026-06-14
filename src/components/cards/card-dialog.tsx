"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { repository } from "@/lib/db/dexie-repository";
import type { VocabCard } from "@/lib/types";

interface CardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string;
  card?: VocabCard;
}

const splitLines = (s: string) =>
  s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

const splitCommas = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export function CardDialog({ open, onOpenChange, deckId, card }: CardDialogProps) {
  const editing = Boolean(card);
  const [word, setWord] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [definition, setDefinition] = useState("");
  const [examples, setExamples] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [antonyms, setAntonyms] = useState("");
  const [cefr, setCefr] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setWord(card?.word ?? "");
    setPhonetic(card?.phonetic ?? "");
    setPartOfSpeech(card?.partOfSpeech ?? "");
    setDefinition(card?.definition ?? "");
    setExamples((card?.examples ?? []).join("\n"));
    setSynonyms((card?.synonyms ?? []).join(", "));
    setAntonyms((card?.antonyms ?? []).join(", "));
    setCefr(card?.cefr ?? "");
    setMnemonic(card?.mnemonic ?? "");
  }, [open, card]);

  async function handleSave() {
    if (!word.trim() || !definition.trim()) {
      toast.error("A word and a definition are required.");
      return;
    }
    setSaving(true);
    const patch = {
      word: word.trim(),
      phonetic: phonetic.trim() || undefined,
      partOfSpeech: partOfSpeech.trim() || undefined,
      definition: definition.trim(),
      examples: splitLines(examples),
      synonyms: splitCommas(synonyms),
      antonyms: splitCommas(antonyms),
      cefr: cefr.trim() || undefined,
      mnemonic: mnemonic.trim() || undefined,
    };
    try {
      if (card) {
        await repository.cards.update(card.id, patch);
        toast.success("Card updated");
      } else {
        await repository.cards.create({ deckId, source: "manual", ...patch });
        toast.success(`Added "${patch.word}"`);
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not save the card.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit card" : "New card"}</DialogTitle>
          <DialogDescription>
            Fill in the word details. Examples go one per line.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-4 px-0.5 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="c-word">Word</Label>
                <Input
                  id="c-word"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-phon">Pronunciation</Label>
                <Input
                  id="c-phon"
                  value={phonetic}
                  onChange={(e) => setPhonetic(e.target.value)}
                  placeholder="/ˈwɜːrd/"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="c-pos">Part of speech</Label>
                <Input
                  id="c-pos"
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  placeholder="noun, verb…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-cefr">CEFR level</Label>
                <Input
                  id="c-cefr"
                  value={cefr}
                  onChange={(e) => setCefr(e.target.value)}
                  placeholder="A1–C2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-def">Definition</Label>
              <Textarea
                id="c-def"
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-ex">Examples</Label>
              <Textarea
                id="c-ex"
                value={examples}
                onChange={(e) => setExamples(e.target.value)}
                rows={3}
                placeholder="One example sentence per line"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="c-syn">Synonyms</Label>
                <Input
                  id="c-syn"
                  value={synonyms}
                  onChange={(e) => setSynonyms(e.target.value)}
                  placeholder="comma, separated"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-ant">Antonyms</Label>
                <Input
                  id="c-ant"
                  value={antonyms}
                  onChange={(e) => setAntonyms(e.target.value)}
                  placeholder="comma, separated"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-mn">Memory hook</Label>
              <Input
                id="c-mn"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="Optional mnemonic"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
