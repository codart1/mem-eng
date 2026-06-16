import { NextResponse } from "next/server";
import { isAllowedArticleUrl } from "@/lib/news/feeds";
import { extractArticle } from "@/lib/news/article";

export const runtime = "nodejs";
// Articles don't change once published; cache extracted content for an hour.
export const revalidate = 3600;

const FETCH_TIMEOUT_MS = 9000;
const MAX_HTML_BYTES = 5_000_000;

/** Extract and return the readable content of a single news article. */
export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get("url") ?? "";

  // Security boundary: only fetch pages from known publishers (prevents SSRF).
  if (!isAllowedArticleUrl(url)) {
    return NextResponse.json(
      { error: "That article can't be opened in the reader." },
      { status: 400 },
    );
  }

  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; LexioNewsReader/1.0; +https://lexio.app)",
        accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Couldn't load the article from the publisher." },
        { status: 502 },
      );
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_HTML_BYTES) {
      return NextResponse.json(
        { error: "This article is too large to open in the reader." },
        { status: 413 },
      );
    }
    html = new TextDecoder("utf-8").decode(buf);
  } catch {
    return NextResponse.json(
      { error: "Couldn't reach the publisher. Check your connection." },
      { status: 504 },
    );
  }

  try {
    const article = extractArticle(html, url);
    return NextResponse.json(article, {
      headers: {
        "cache-control": `public, s-maxage=${revalidate}, stale-while-revalidate=86400`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "This article couldn't be converted for reading. Open the original instead." },
      { status: 422 },
    );
  }
}
