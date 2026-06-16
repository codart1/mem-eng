"use client";

import { Bookmark as BookmarkIcon, Sparkles, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { Bookmark, Chapter } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapters: Chapter[];
  currentIndex: number;
  onSelectChapter: (index: number) => void;
  bookmarks: Bookmark[];
  onRemoveBookmark: (id: string) => void;
}

export function ReaderToc({
  open,
  onOpenChange,
  chapters,
  currentIndex,
  onSelectChapter,
  bookmarks,
  onRemoveBookmark,
}: Props) {
  const t = useT();

  const chapterTitle = (chapter: Chapter, index: number) =>
    chapter.title || t.reader.untitledChapter.replace("{n}", String(index + 1));

  const spots = bookmarks.filter((b) => b.type === "bookmark");
  const highlights = bookmarks.filter((b) => b.type === "highlight");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 gap-0 sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{t.reader.contents}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-6">
          <nav className="space-y-0.5">
            {chapters.map((chapter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectChapter(i)}
                className={cn(
                  "block w-full truncate rounded-md px-3 py-2 text-left text-sm transition-colors",
                  i === currentIndex
                    ? "bg-brand/10 text-brand font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {chapterTitle(chapter, i)}
              </button>
            ))}
          </nav>

          <section className="space-y-2">
            <h3 className="text-muted-foreground px-3 text-xs font-semibold tracking-wide uppercase">
              {t.reader.bookmarks}
            </h3>
            {spots.length === 0 ? (
              <p className="text-muted-foreground px-3 text-xs">
                {t.reader.noBookmarks}
              </p>
            ) : (
              <ul className="space-y-0.5">
                {spots.map((b) => (
                  <li key={b.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectChapter(b.chapterIndex)}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground flex min-w-0 flex-1 items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors"
                    >
                      <BookmarkIcon className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {b.text ||
                          chapterTitle(chapters[b.chapterIndex], b.chapterIndex)}
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t.reader.removeBookmark}
                      onClick={() => onRemoveBookmark(b.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {highlights.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-muted-foreground px-3 text-xs font-semibold tracking-wide uppercase">
                {t.reader.highlightsTitle}
              </h3>
              <ul className="flex flex-wrap gap-1.5 px-3">
                {highlights.map((b) => (
                  <li
                    key={b.id}
                    className="bg-brand/10 text-brand inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                  >
                    <Sparkles className="size-3" />
                    {b.text}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
