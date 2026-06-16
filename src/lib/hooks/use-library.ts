"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { repository } from "@/lib/db/dexie-repository";
import type { Book, BookContent, Bookmark } from "@/lib/types";

/** All books in the library, most-recently-read first. */
export function useBooks(): Book[] | undefined {
  return useLiveQuery(() => repository.books.list(), []);
}

export function useBook(id?: string): Book | undefined {
  return useLiveQuery(() => (id ? repository.books.get(id) : undefined), [id]);
}

/** The heavy parsed content for a book (chapters + image blobs). */
export function useBookContent(id?: string): BookContent | undefined {
  return useLiveQuery(
    () => (id ? repository.books.getContent(id) : undefined),
    [id],
  );
}

export function useBookmarks(bookId?: string): Bookmark[] | undefined {
  return useLiveQuery(
    () =>
      bookId ? repository.bookmarks.listByBook(bookId) : Promise.resolve([]),
    [bookId],
  );
}
