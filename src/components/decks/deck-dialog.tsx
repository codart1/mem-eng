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
import { cn } from "@/lib/utils";
import { DECK_COLORS, type Deck, type DeckColor } from "@/lib/types";
import { DECK_COLOR_VALUES } from "@/lib/deck-color";
import { repository } from "@/lib/db/dexie-repository";
import { useT } from "@/lib/i18n";

interface DeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog edits this deck; otherwise it creates a new one. */
  deck?: Deck;
  onSaved?: (deck: Deck) => void;
}

export function DeckDialog({
  open,
  onOpenChange,
  deck,
  onSaved,
}: DeckDialogProps) {
  const t = useT();
  const editing = Boolean(deck);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<DeckColor>("teal");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(deck?.name ?? "");
      setDescription(deck?.description ?? "");
      setColor((deck?.color as DeckColor) ?? "teal");
    }
  }, [open, deck]);

  async function handleSave() {
    if (!name.trim()) {
      toast.error(t.deckDialog.nameRequired);
      return;
    }
    setSaving(true);
    try {
      const saved = deck
        ? await repository.decks.update(deck.id, {
            name: name.trim(),
            description: description.trim() || undefined,
            color,
          })
        : await repository.decks.create({
            name: name.trim(),
            description: description.trim() || undefined,
            color,
          });
      toast.success(editing ? t.deckDialog.updated : t.deckDialog.created);
      if (saved) onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(t.deckDialog.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? t.deckDialog.editTitle : t.deckDialog.newTitle}</DialogTitle>
          <DialogDescription>{t.deckDialog.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label htmlFor="deck-name">{t.deckDialog.name}</Label>
            <Input
              id="deck-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.deckDialog.namePlaceholder}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deck-desc">{t.deckDialog.descLabel}</Label>
            <Textarea
              id="deck-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.deckDialog.descPlaceholder}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>{t.deckDialog.color}</Label>
            <div className="flex flex-wrap gap-2">
              {DECK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-8 rounded-full ring-offset-2 ring-offset-background transition-all",
                    color === c
                      ? "ring-foreground ring-2"
                      : "hover:scale-110",
                  )}
                  style={{ backgroundColor: DECK_COLOR_VALUES[c] }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving
              ? t.common.saving
              : editing
                ? t.common.saveChanges
                : t.deckDialog.createDeck}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
