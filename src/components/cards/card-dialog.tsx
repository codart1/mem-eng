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
import { useT } from "@/lib/i18n";

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
  const t = useT();
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
      toast.error(t.cardDialog.required);
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
        toast.success(t.cardDialog.updated);
      } else {
        await repository.cards.create({ deckId, source: "manual", ...patch });
        toast.success(t.cardDialog.added.replace("{word}", patch.word));
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(t.cardDialog.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? t.cardDialog.editTitle : t.cardDialog.newTitle}</DialogTitle>
          <DialogDescription>{t.cardDialog.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-4 px-0.5 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="c-word">{t.cardDialog.word}</Label>
                <Input
                  id="c-word"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-phon">{t.cardDialog.pronunciation}</Label>
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
                <Label htmlFor="c-pos">{t.cardDialog.partOfSpeech}</Label>
                <Input
                  id="c-pos"
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  placeholder={t.cardDialog.posPlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-cefr">{t.cardDialog.cefr}</Label>
                <Input
                  id="c-cefr"
                  value={cefr}
                  onChange={(e) => setCefr(e.target.value)}
                  placeholder={t.cardDialog.cefrPlaceholder}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-def">{t.cardDialog.definition}</Label>
              <Textarea
                id="c-def"
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-ex">{t.cardDialog.examples}</Label>
              <Textarea
                id="c-ex"
                value={examples}
                onChange={(e) => setExamples(e.target.value)}
                rows={3}
                placeholder={t.cardDialog.examplesPlaceholder}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="c-syn">{t.common.synonyms}</Label>
                <Input
                  id="c-syn"
                  value={synonyms}
                  onChange={(e) => setSynonyms(e.target.value)}
                  placeholder={t.cardDialog.commaSeparated}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-ant">{t.common.antonyms}</Label>
                <Input
                  id="c-ant"
                  value={antonyms}
                  onChange={(e) => setAntonyms(e.target.value)}
                  placeholder={t.cardDialog.commaSeparated}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-mn">{t.cardDialog.memoryHook}</Label>
              <Input
                id="c-mn"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder={t.cardDialog.mnemonicPlaceholder}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving
              ? t.common.saving
              : editing
                ? t.common.saveChanges
                : t.cardDialog.addCard}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
