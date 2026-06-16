import { redirect } from "next/navigation";
import { ArticleReader } from "@/components/news/article-reader";

/** In-app reader for a single article. The URL to read comes in via `?u=`. */
export default async function ReadPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string }>;
}) {
  const { u } = await searchParams;
  if (!u) redirect("/news");
  return <ArticleReader url={u} />;
}
