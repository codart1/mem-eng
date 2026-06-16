import { NextResponse } from "next/server";
import { isAllowedArticleUrl } from "@/lib/news/feeds";
import { extractArticle } from "@/lib/news/article";
import { fetchAsBrowser } from "@/lib/news/http";

export const runtime = "nodejs";
// Articles don't change once published; cache extracted content for an hour.
export const revalidate = 3600;

const FETCH_TIMEOUT_MS = 9000;
const MAX_HTML_BYTES = 5_000_000;

/** Extract and return the readable content of a single news article. */
export async function GET(req: Request) {
  try {
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
      const res = await fetchAsBrowser(url, {
        timeoutMs: FETCH_TIMEOUT_MS,
        accept: "text/html,application/xhtml+xml",
      });
      if (!res.ok) {
        return NextResponse.json(
          { error: `Couldn't load the article from the publisher. Publisher responded with status ${res.status}.` },
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
    } catch (err: any) {
      return NextResponse.json(
        { 
          error: "Publisher connection failure",
          message: err?.message || String(err),
          stack: err?.stack 
        },
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
    } catch (err: any) {
      return NextResponse.json(
        { 
          error: "Article conversion failure",
          message: err?.message || String(err),
          stack: err?.stack
        },
        { status: 422 },
      );
    }
  } catch (globalErr: any) {
    console.error("Global API Error in GET /api/article:", globalErr);
    return NextResponse.json(
      {
        error: "Server Error",
        message: globalErr?.message || String(globalErr),
        stack: globalErr?.stack,
      },
      { status: 500 },
    );
  }
}
