"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  Settings2,
  BookOpen,
  Bookmark as BookmarkIcon,
} from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { SelectionVocab } from "@/components/vocab/selection-vocab";
import { WordAddSheet } from "@/components/vocab/word-add-sheet";
import { BookBlockView } from "./book-block-view";
import { ReaderToc } from "./reader-toc";
import { ReaderSettings } from "./reader-settings";
import {
  useBook,
  useBookContent,
  useBookmarks,
} from "@/lib/hooks/use-library";
import { useDecks, useAllCards } from "@/lib/hooks/use-data";
import { useReaderPrefs } from "@/lib/hooks/use-reader-prefs";
import { repository } from "@/lib/db/dexie-repository";
import { db } from "@/lib/db/schema";
import type { ReaderPrefs } from "@/lib/hooks/use-reader-prefs";
import { useT } from "@/lib/i18n";

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

const WIDTHS: Record<ReaderPrefs["width"], string> = {
  narrow: "34rem",
  normal: "42rem",
  wide: "52rem",
};

const THEME_STYLE: Record<ReaderPrefs["theme"], React.CSSProperties> = {
  default: {},
  sepia: { backgroundColor: "#f6edd9", color: "#4a4031" },
  dark: { backgroundColor: "#15171b", color: "#cbd0d8" },
};

export function BookReader({ bookId }: { bookId: string }) {
  const t = useT();
  const book = useBook(bookId);
  const content = useBookContent(bookId);
  const bookmarks = useBookmarks(bookId) ?? [];
  const decks = useDecks();
  const cards = useAllCards();
  const { prefs, update, mounted } = useReaderPrefs();

  // undefined while loading, true/false once resolved — lets us tell "missing"
  // apart from "still loading" (a bare live query returns undefined for both).
  const exists = useLiveQuery(
    async () => (await db.books.get(bookId)) != null,
    [bookId],
  );

  const [chapterIndex, setChapterIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [deckId, setDeckId] = useState("");
  const [tocOpen, setTocOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const resumedRef = useRef(false);

  const chapters = content?.chapters ?? [];
  const chapterCount = chapters.length;

  // Object URLs for the book's images, rebuilt when content loads.
  const [resourceUrls, setResourceUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!content) return;
    const urls: Record<string, string> = {};
    for (const [path, blob] of Object.entries(content.resources)) {
      urls[path] = URL.createObjectURL(blob);
    }
    setResourceUrls(urls);
    return () => {
      for (const url of Object.values(urls)) URL.revokeObjectURL(url);
    };
  }, [content]);

  const savedWords = useMemo(
    () => new Set((cards ?? []).map((c) => c.word.toLowerCase())),
    [cards],
  );

  const effectiveDeckId =
    deckId && decks?.some((d) => d.id === deckId)
      ? deckId
      : (decks?.[0]?.id ?? "");

  const saveProgress = useCallback(
    (index: number, scrollRatio: number) => {
      if (!chapterCount) return;
      const pct = clamp(((index + scrollRatio) / chapterCount) * 100, 0, 100);
      void repository.books.updateProgress(bookId, {
        chapterIndex: index,
        scrollRatio,
        pct,
      });
    },
    [bookId, chapterCount],
  );

  // Resume at the saved chapter + scroll position, once, after content loads.
  useEffect(() => {
    if (resumedRef.current || !book || !content) return;
    resumedRef.current = true;
    const index = clamp(book.progress.chapterIndex, 0, chapterCount - 1);
    setChapterIndex(index);
    const ratio = book.progress.scrollRatio;
    if (ratio > 0) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const max =
            document.documentElement.scrollHeight - window.innerHeight;
          if (max > 0) window.scrollTo(0, ratio * max);
        }),
      );
    }
  }, [book, content, chapterCount]);

  // Persist scroll position within the current chapter (throttled).
  useEffect(() => {
    if (!chapterCount) return;
    let last = 0;
    const onScroll = () => {
      const nowMs = Date.now();
      if (nowMs - last < 700) return;
      last = nowMs;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      saveProgress(chapterIndex, ratio);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapterIndex, chapterCount, saveProgress]);

  const goToChapter = useCallback(
    (index: number) => {
      const next = clamp(index, 0, chapterCount - 1);
      setChapterIndex(next);
      setTocOpen(false);
      window.scrollTo(0, 0);
      saveProgress(next, 0);
    },
    [chapterCount, saveProgress],
  );

  async function addBookmark() {
    const chapter = chapters[chapterIndex];
    await repository.bookmarks.add({
      bookId,
      chapterIndex,
      type: "bookmark",
      text:
        chapter?.title ||
        t.reader.untitledChapter.replace("{n}", String(chapterIndex + 1)),
    });
    toast.success(t.reader.bookmarkAdded);
  }

  async function handleWordAdded(word: string) {
    setSelectedWord(null);
    // Record what was collected from this book (shown in the contents sheet).
    await repository.bookmarks.add({
      bookId,
      chapterIndex,
      type: "highlight",
      text: word,
    });
  }

  // --- loading / not-found ------------------------------------------------
  if (exists === false) {
    return (
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" size="sm" render={<Link href="/library" />}>
          <ArrowLeft className="size-4" /> {t.reader.backToLibrary}
        </Button>
        <EmptyState
          className="mt-6"
          icon={BookOpen}
          title={t.reader.notFoundTitle}
          description={t.reader.notFoundDescription}
        />
      </div>
    );
  }

  if (!book || !content || !mounted) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-3/4" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  const chapter = chapters[chapterIndex];
  const pct = Math.round(book.progress.pct);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-1">
        <Button variant="ghost" size="sm" render={<Link href="/library" />}>
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">{t.reader.backToLibrary}</span>
        </Button>
        <span className="text-muted-foreground mx-1 min-w-0 flex-1 truncate text-sm font-medium">
          {book.title}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t.reader.contents}
          onClick={() => setTocOpen(true)}
        >
          <List className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t.reader.addBookmark}
          onClick={addBookmark}
        >
          <BookmarkIcon className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t.reader.settings}
          onClick={() => setSettingsOpen(true)}
        >
          <Settings2 className="size-4" />
        </Button>
      </div>

      <p className="text-muted-foreground mb-4 text-xs">
        {t.reader.chapterOf
          .replace("{current}", String(chapterIndex + 1))
          .replace("{total}", String(chapterCount))}
        {pct > 0 && ` · ${t.library.progress.replace("{pct}", String(pct))}`}
      </p>

      {/* Reading surface */}
      <article
        className="mx-auto rounded-xl px-1 sm:px-6 sm:py-4"
        style={{
          maxWidth: WIDTHS[prefs.width],
          fontSize: `${1.0625 * prefs.fontScale}rem`,
          lineHeight: prefs.lineSpacing,
          ...THEME_STYLE[prefs.theme],
        }}
      >
        {chapter?.title && (
          <h1 className="mb-5 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            {chapter.title}
          </h1>
        )}
        <div className="space-y-4 [&_p]:text-pretty">
          {chapter?.blocks.map((block, i) => (
            <BookBlockView
              key={i}
              block={block}
              onWord={setSelectedWord}
              savedWords={savedWords}
              resourceUrls={resourceUrls}
            />
          ))}
        </div>
      </article>

      {/* Chapter navigation */}
      <div className="mt-10 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={chapterIndex === 0}
          onClick={() => goToChapter(chapterIndex - 1)}
        >
          <ChevronLeft className="size-4" /> {t.reader.prevChapter}
        </Button>
        <Button
          variant="outline"
          disabled={chapterIndex >= chapterCount - 1}
          onClick={() => goToChapter(chapterIndex + 1)}
        >
          {t.reader.nextChapter} <ChevronRight className="size-4" />
        </Button>
      </div>

      <ReaderToc
        open={tocOpen}
        onOpenChange={setTocOpen}
        chapters={chapters}
        currentIndex={chapterIndex}
        onSelectChapter={goToChapter}
        bookmarks={bookmarks}
        onRemoveBookmark={(id) => void repository.bookmarks.remove(id)}
      />

      <ReaderSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        prefs={prefs}
        update={update}
      />

      <SelectionVocab onSelect={setSelectedWord} />

      <WordAddSheet
        word={selectedWord}
        onOpenChange={(open) => !open && setSelectedWord(null)}
        decks={decks ?? []}
        deckId={effectiveDeckId}
        onDeckIdChange={setDeckId}
        onAdded={handleWordAdded}
        subtitle={t.reader.addSheetSubtitle}
      />
    </div>
  );
}
