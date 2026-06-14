"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardStateBadge } from "./card-state-badge";
import { CardDialog } from "./card-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { repository } from "@/lib/db/dexie-repository";
import type { VocabCard } from "@/lib/types";

function CardRow({ card }: { card: VocabCard }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-medium">{card.word}</span>
          {card.phonetic && (
            <span className="text-muted-foreground font-mono text-xs">
              {card.phonetic}
            </span>
          )}
          {card.partOfSpeech && (
            <span className="text-muted-foreground text-xs italic">
              {card.partOfSpeech}
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
          {card.definition}
        </p>
        <div className="mt-1.5">
          <CardStateBadge card={card} />
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label="Card options" />}
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CardDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        deckId={card.deckId}
        card={card}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${card.word}"?`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await repository.cards.remove(card.id);
          toast.success("Card deleted");
        }}
      />
    </div>
  );
}

export function CardList({ cards }: { cards: VocabCard[] }) {
  return (
    <div className="bg-card divide-y overflow-hidden rounded-xl border">
      {cards.map((card) => (
        <CardRow key={card.id} card={card} />
      ))}
    </div>
  );
}
