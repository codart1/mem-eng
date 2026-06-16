import type { NewsArticle } from "./types";

/**
 * Minimal, dependency-free RSS 2.0 / Atom parser. We only need a handful of
 * fields per item, and pulling in a full XML library (or relying on DOMParser,
 * which isn't in the Node runtime) would be overkill. Tolerant by design:
 * malformed or partial items are skipped rather than throwing.
 */

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#39": "'",
  "#x27": "'",
  "#34": '"',
};

/** Decode the common named/numeric XML & HTML entities found in feeds. */
export function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, code: string) => {
    if (ENTITIES[code] !== undefined) return ENTITIES[code];
    if (code[0] === "#") {
      const isHex = code[1] === "x" || code[1] === "X";
      const num = parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      if (Number.isFinite(num)) return String.fromCodePoint(num);
    }
    return match;
  });
}

/** Strip CDATA wrappers, HTML tags, and entities down to clean plain text. */
export function toPlainText(raw: string): string {
  let s = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  // Feeds carry markup two ways: real tags (often inside CDATA) and
  // entity-escaped tags (e.g. "&lt;p&gt;", as The Guardian does). Decode first
  // so escaped tags become real, then strip; two passes catch double-encoding.
  for (let i = 0; i < 2; i++) {
    s = decodeEntities(s).replace(/<[^>]*>/g, " ");
  }
  return s
    .replace(/\s+/g, " ")
    // Stripping tags can leave a stray space before punctuation, e.g.
    // "one <b>two</b>." -> "one two .". Tuck punctuation back onto the word.
    .replace(/\s+([.,;:!?)])/g, "$1")
    .trim();
}

/** Pull the inner text of the first `<tag>…</tag>` (any namespace prefix). */
function tag(block: string, name: string): string | undefined {
  const re = new RegExp(`<(?:[a-zA-Z]+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[a-zA-Z]+:)?${name}>`, "i");
  const m = block.match(re);
  return m?.[1];
}

/** Atom `<link href="…"/>`, preferring rel="alternate" or an unspecified rel. */
function atomLink(block: string): string | undefined {
  const links = [...block.matchAll(/<(?:[a-zA-Z]+:)?link\b([^>]*)\/?>/gi)];
  let fallback: string | undefined;
  for (const [, attrs] of links) {
    const href = attrs.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    const rel = attrs.match(/rel\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!rel || rel === "alternate") return decodeEntities(href.trim());
    fallback ??= decodeEntities(href.trim());
  }
  return fallback;
}

/** Pull a thumbnail URL from common feed image extensions, if present. */
function itemImage(block: string): string | undefined {
  // <media:thumbnail url="…"> or <media:content … url="…" medium="image">
  const media = block.match(
    /<media:(?:thumbnail|content)\b[^>]*\burl\s*=\s*["']([^"']+)["'][^>]*>/i,
  );
  if (media?.[1]) return decodeEntities(media[1].trim());
  // <enclosure url="…" type="image/…">
  const enclosures = [...block.matchAll(/<enclosure\b([^>]*)>/gi)];
  for (const [, attrs] of enclosures) {
    const type = attrs.match(/type\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
    const url = attrs.match(/url\s*=\s*["']([^"']+)["']/i)?.[1];
    if (url && (type.startsWith("image/") || /\.(jpe?g|png|webp|gif)/i.test(url))) {
      return decodeEntities(url.trim());
    }
  }
  return undefined;
}

function parseDate(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const t = Date.parse(value.trim());
  return Number.isNaN(t) ? undefined : t;
}

/** Split a feed body into raw `<item>` (RSS) or `<entry>` (Atom) blocks. */
function itemBlocks(xml: string): string[] {
  const rss = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((m) => m[1]);
  if (rss.length > 0) return rss;
  return [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)].map((m) => m[1]);
}

export interface ParseContext {
  source: string;
  category: string;
  /** Time used when an item omits a publish date. */
  fetchedAt: number;
}

/** Parse a raw RSS/Atom document into normalized {@link NewsArticle}s. */
export function parseFeed(xml: string, ctx: ParseContext): NewsArticle[] {
  const articles: NewsArticle[] = [];

  for (const block of itemBlocks(xml)) {
    const title = tag(block, "title");
    if (!title) continue;

    const link =
      toPlainText(tag(block, "link") ?? "") || atomLink(block) || "";
    const guid = toPlainText(tag(block, "guid") ?? tag(block, "id") ?? "");
    const id = guid || link;
    if (!id) continue;

    const summaryRaw =
      tag(block, "description") ?? tag(block, "summary") ?? tag(block, "content") ?? "";
    const publishedAt =
      parseDate(tag(block, "pubDate")) ??
      parseDate(tag(block, "published")) ??
      parseDate(tag(block, "updated")) ??
      ctx.fetchedAt;

    articles.push({
      id,
      title: toPlainText(title),
      summary: toPlainText(summaryRaw),
      link: link || id,
      source: ctx.source,
      category: ctx.category,
      publishedAt,
      image: itemImage(block),
    });
  }

  return articles;
}
