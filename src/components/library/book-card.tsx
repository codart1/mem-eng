"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { repository } from "@/lib/db/dexie-repository";
import { useObjectUrl } from "@/lib/hooks/use-object-url";
import type { Book } from "@/lib/types";
import { useT } from "@/lib/i18n";

export function BookCard({ book }: { book: Book }) {
  const t = useT();
  const coverUrl = useObjectUrl(book.coverBlob);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const pct = Math.round(book.progress.pct);

  return (
    <Card className="group relative gap-0 overflow-hidden p-0">
      <Link href={`/library/read?id=${book.id}`} className="block">
        <div className="bg-muted relative aspect-[2/3] w-full overflow-hidden">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
              <BookOpen className="size-8" />
              <span className="line-clamp-3 font-serif text-sm font-medium">
                {book.title}
              </span>
            </div>
          )}
          {pct > 0 && (
            <span className="bg-background/85 text-foreground absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur">
              {t.library.progress.replace("{pct}", String(pct))}
            </span>
          )}
        </div>
      </Link>

      <div className="flex items-start justify-between gap-1 p-3">
        <Link href={`/library/read?id=${book.id}`} className="min-w-0 flex-1">
          <h3 className="truncate font-serif text-sm font-semibold">
            {book.title}
          </h3>
          <p className="text-muted-foreground truncate text-xs">
            {book.author
              ? t.library.by.replace("{author}", book.author)
              : t.library.unknownAuthor}
          </p>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t.library.options}
                className="-mr-1 opacity-60 group-hover:opacity-100"
              />
            }
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" /> {t.common.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t.library.deleteTitle.replace("{title}", book.title)}
        description={t.library.deleteDescription}
        confirmLabel={t.library.deleteConfirm}
        destructive
        onConfirm={async () => {
          await repository.books.remove(book.id);
          toast.success(t.library.deleted);
        }}
      />
    </Card>
  );
}
