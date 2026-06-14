"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2, GraduationCap, Layers } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeckDialog } from "./deck-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deckColor } from "@/lib/deck-color";
import { repository } from "@/lib/db/dexie-repository";
import type { DeckStat } from "@/lib/hooks/use-data";
import { useT } from "@/lib/i18n";

export function DeckCard({ stat }: { stat: DeckStat }) {
  const t = useT();
  const { deck, total, due, newCount } = stat;
  const router = useRouter();
  const color = deckColor(deck.color);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const actionable = due + Math.min(newCount, 1) > 0 || newCount > 0;

  return (
    <Card className="group relative gap-0 overflow-hidden p-0">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-start justify-between gap-2 p-5 pb-3">
        <Link href={`/decks/${deck.id}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h3 className="truncate font-serif text-lg font-semibold">
              {deck.name}
            </h3>
          </div>
          {deck.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {deck.description}
            </p>
          )}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t.deckCard.options}
                className="opacity-60 group-hover:opacity-100"
              />
            }
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" /> {t.common.edit}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" /> {t.common.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-muted-foreground flex items-center gap-4 px-5 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Layers className="size-4" /> {total} {t.deckCard.cards}
        </span>
        {due > 0 && (
          <span className="text-rating-good inline-flex items-center gap-1.5 font-medium">
            {due} {t.deckCard.due}
          </span>
        )}
        {newCount > 0 && (
          <span className="text-brand inline-flex items-center gap-1.5 font-medium">
            {newCount} {t.deckCard.new}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 p-5 pt-0">
        <Button
          size="sm"
          className="flex-1"
          disabled={!actionable}
          onClick={() => router.push(`/study/${deck.id}`)}
        >
          <GraduationCap className="size-4" />
          {actionable ? t.deckCard.study : t.deckCard.allDone}
        </Button>
        <Button variant="outline" size="sm" render={<Link href={`/decks/${deck.id}`} />}>
          {t.deckCard.browse}
        </Button>
      </div>

      <DeckDialog open={editOpen} onOpenChange={setEditOpen} deck={deck} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t.deckCard.deleteTitle.replace("{name}", deck.name)}
        description={t.deckCard.deleteDescription}
        confirmLabel={t.deckCard.deleteConfirm}
        destructive
        onConfirm={async () => {
          await repository.decks.remove(deck.id);
          toast.success(t.deckCard.deleted);
        }}
      />
    </Card>
  );
}
