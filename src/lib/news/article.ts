import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import type { ArticleBlock, ArticleContent } from "./types";

/**
 * Server-side article extraction: turn a publisher's HTML page into clean,
 * structured {@link ArticleBlock}s plus a cover image. Uses Mozilla Readability
 * (the engine behind Firefox Reader View) for the main content, then walks the
 * result into a safe block list — we never hand raw HTML to the client.
 */

const MAX_BLOCKS = 400;
const WORDS_PER_MINUTE = 200;

/** Resolve a possibly-relative/lazy image URL to an absolute https URL. */
function resolveImage(el: Element, baseUrl: string): string | undefined {
  const raw =
    el.getAttribute("src") ||
    el.getAttribute("data-src") ||
    el.getAttribute("data-lazy-src") ||
    pickFromSrcset(el.getAttribute("srcset") || el.getAttribute("data-srcset"));
  if (!raw) return undefined;
  try {
    const abs = new URL(raw.trim(), baseUrl);
    if (abs.protocol !== "http:" && abs.protocol !== "https:") return undefined;
    return abs.href;
  } catch {
    return undefined;
  }
}

/** Pick the last (usually largest) candidate from a srcset string. */
function pickFromSrcset(srcset: string | null): string | null {
  if (!srcset) return null;
  const candidates = srcset
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
  return candidates.at(-1) ?? null;
}

const collapse = (s: string | null | undefined) =>
  (s ?? "").replace(/\s+/g, " ").trim();

/** Find the cover image from Open Graph / Twitter meta tags. */
function findLeadImage(doc: Document, baseUrl: string): string | undefined {
  const selectors = [
    'meta[property="og:image"]',
    'meta[name="og:image"]',
    'meta[name="twitter:image"]',
    'meta[name="twitter:image:src"]',
  ];
  for (const sel of selectors) {
    const content = doc.querySelector(sel)?.getAttribute("content");
    if (content?.trim()) {
      try {
        return new URL(content.trim(), baseUrl).href;
      } catch {
        /* try next */
      }
    }
  }
  return undefined;
}

/** Walk a Readability content fragment into a flat list of safe blocks. */
function toBlocks(container: Element, baseUrl: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];

  const visit = (el: Element) => {
    if (blocks.length >= MAX_BLOCKS) return;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case "h1":
      case "h2":
      case "h3":
      case "h4": {
        const text = collapse(el.textContent);
        if (text) blocks.push({ type: "heading", level: tag === "h4" ? 3 : 2, text });
        return;
      }
      case "p": {
        // A paragraph that is just an image wrapper -> image block.
        const img = el.querySelector("img");
        const text = collapse(el.textContent);
        if (!text && img) {
          pushImage(img);
          return;
        }
        if (text) blocks.push({ type: "paragraph", text });
        return;
      }
      case "blockquote": {
        const text = collapse(el.textContent);
        if (text) blocks.push({ type: "quote", text });
        return;
      }
      case "ul":
      case "ol": {
        const items = [...el.querySelectorAll(":scope > li")]
          .map((li) => collapse(li.textContent))
          .filter(Boolean);
        if (items.length) blocks.push({ type: "list", ordered: tag === "ol", items });
        return;
      }
      case "figure": {
        const img = el.querySelector("img");
        const caption = collapse(el.querySelector("figcaption")?.textContent);
        if (img) pushImage(img, caption);
        return;
      }
      case "img": {
        pushImage(el);
        return;
      }
      default: {
        // Recurse into structural containers (div, section, article, etc.).
        for (const child of [...el.children]) visit(child);
      }
    }
  };

  const pushImage = (img: Element, caption?: string) => {
    const src = resolveImage(img, baseUrl);
    if (!src) return;
    // Skip tiny tracking pixels / icons when dimensions are declared.
    const w = Number(img.getAttribute("width"));
    if (w && w < 64) return;
    const alt = collapse(img.getAttribute("alt")) || undefined;
    blocks.push({ type: "image", src, alt, caption: caption || undefined });
  };

  for (const child of [...container.children]) visit(child);
  return blocks;
}

/** Extract readable content from a raw HTML page, or throw on failure. */
export function extractArticle(html: string, url: string): ArticleContent {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;
  const leadImage = findLeadImage(doc, url);

  // Readability mutates the document, so capture meta before parsing.
  const reader = new Readability(doc, { keepClasses: false });
  const parsed = reader.parse();
  if (!parsed || !parsed.content) {
    throw new Error("Could not extract this article.");
  }

  const fragment = new JSDOM(
    `<div id="root">${parsed.content}</div>`,
    { url },
  ).window.document.getElementById("root")!;

  const blocks = toBlocks(fragment, url);
  if (blocks.length === 0) {
    throw new Error("Could not extract this article.");
  }

  const wordCount = blocks.reduce((n, b) => {
    if (b.type === "paragraph" || b.type === "quote" || b.type === "heading") {
      return n + b.text.split(/\s+/).length;
    }
    if (b.type === "list") return n + b.items.join(" ").split(/\s+/).length;
    return n;
  }, 0);

  return {
    url,
    title: collapse(parsed.title) || "Untitled",
    byline: collapse(parsed.byline) || undefined,
    siteName: collapse(parsed.siteName) || undefined,
    leadImage,
    readingMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
    blocks,
  };
}
