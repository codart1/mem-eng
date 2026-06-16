"use client";

import { Library as LibraryIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { AddBookButton } from "@/components/library/add-book-button";
import { BookCard } from "@/components/library/book-card";
import { useBooks } from "@/lib/hooks/use-library";
import { useT } from "@/lib/i18n";

export default function LibraryPage() {
  const t = useT();
  const books = useBooks();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.library.title}
        description={t.library.description}
        actions={<AddBookButton />}
      />

      {books === undefined && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
          ))}
        </div>
      )}

      {books && books.length === 0 && (
        <EmptyState
          icon={LibraryIcon}
          title={t.library.emptyTitle}
          description={t.library.emptyDescription}
          action={<AddBookButton />}
        />
      )}

      {books && books.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
