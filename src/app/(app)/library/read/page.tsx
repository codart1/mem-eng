import { redirect } from "next/navigation";
import { BookReader } from "@/components/library/book-reader";

/** In-app reader for a single book. The book id comes in via `?id=`. */
export default async function ReadBookPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/library");
  return <BookReader bookId={id} />;
}
