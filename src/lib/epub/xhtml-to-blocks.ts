import type { ContentBlock } from "@/lib/types";

/**
 * Convert a parsed XHTML chapter document into a flat list of safe
 * {@link ContentBlock}s. Mirrors the news extractor's `toBlocks`
 * (`src/lib/news/article.ts`) but for EPUB chapters: no Readability, and images
 * are resolved to an in-archive resource key (not an absolute URL) via the
 * `resolveImage` callback the parser supplies.
 *
 * Kept as a pure function over a DOM `ParentNode` so it's environment-agnostic
 * and unit-testable under jsdom.
 */

const MAX_BLOCKS = 2000;

const collapse = (s: string | null | undefined) =>
  (s ?? "").replace(/\s+/g, " ").trim();

interface Options {
  /** Map an `<img>`'s raw `src` to a stored resource key, or skip (undefined). */
  resolveImage: (rawSrc: string) => string | undefined;
}

export function xhtmlToBlocks(
  root: ParentNode,
  { resolveImage }: Options,
): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  const pushImage = (img: Element, caption?: string) => {
    const raw = img.getAttribute("src");
    if (!raw) return;
    const src = resolveImage(raw);
    if (!src) return;
    const alt = collapse(img.getAttribute("alt")) || undefined;
    blocks.push({ type: "image", src, alt, caption: caption || undefined });
  };

  const visit = (el: Element) => {
    if (blocks.length >= MAX_BLOCKS) return;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6": {
        const text = collapse(el.textContent);
        if (text) {
          blocks.push({
            type: "heading",
            level: tag === "h1" || tag === "h2" ? 2 : 3,
            text,
          });
        }
        return;
      }
      case "p":
      case "div": {
        // A block that is purely an image wrapper -> image block. Otherwise, if
        // it has its own text, emit a paragraph; if it's a structural container
        // with child blocks, recurse instead of flattening everything to text.
        const text = collapse(el.textContent);
        const img = el.querySelector("img, image, svg image");
        if (!text) {
          if (img) pushImage(img);
          return;
        }
        // `div` is often a wrapper; recurse when it holds block-level children
        // so we don't merge several paragraphs into one giant block.
        if (tag === "div" && el.querySelector("p, div, ul, ol, blockquote, h1, h2, h3, h4, h5, h6")) {
          for (const child of [...el.children]) visit(child);
          return;
        }
        blocks.push({ type: "paragraph", text });
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
      case "script":
      case "style":
      case "nav":
        return;
      default: {
        for (const child of [...el.children]) visit(child);
      }
    }
  };

  // Prefer the <body>; fall back to the root for fragments without one.
  const body =
    ("querySelector" in root && (root as Element | Document).querySelector("body")) ||
    root;
  for (const child of [...(body as ParentNode).children]) visit(child);
  return blocks;
}
