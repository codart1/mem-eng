import { unzipSync, strFromU8 } from "fflate";
import type { Chapter, ContentBlock } from "@/lib/types";
import type { ParsedBook } from "./types";
import { xhtmlToBlocks } from "./xhtml-to-blocks";

/**
 * Parse an EPUB file (a ZIP of XHTML) entirely in the browser into a
 * {@link ParsedBook}. No network and no server route — the file is on-device,
 * which keeps the library fully offline-first.
 *
 * Pipeline: container.xml -> OPF (metadata + manifest + spine) -> each spine
 * XHTML doc -> {@link xhtmlToBlocks}. Images referenced by chapters are pulled
 * from the archive into `resources` (keyed by normalized path). Chapter titles
 * come from the EPUB3 nav doc or the EPUB2 NCX, falling back to spine order.
 *
 * Uses the browser's native `DOMParser`, so this only runs client-side (and in
 * jsdom under tests).
 */

const XHTML_TYPES = new Set([
  "application/xhtml+xml",
  "text/html",
  "application/x-dtbook+xml",
]);

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  avif: "image/avif",
};

export function parseEpub(buffer: ArrayBuffer): ParsedBook {
  const files = unzipSync(new Uint8Array(buffer));
  const parser = new DOMParser();

  const readText = (path: string): string | undefined => {
    const bytes = files[path];
    return bytes ? strFromU8(bytes) : undefined;
  };
  const readXml = (path: string): Document | undefined => {
    const text = readText(path);
    if (!text) return undefined;
    return parser.parseFromString(text, "application/xml");
  };

  // 1. container.xml -> OPF path.
  const container = readXml("META-INF/container.xml");
  const opfPath = container
    ?.querySelector("rootfile")
    ?.getAttribute("full-path");
  if (!opfPath) throw new Error("Not a valid EPUB: missing container.xml rootfile.");

  const opf = readXml(opfPath);
  if (!opf) throw new Error("Not a valid EPUB: missing OPF package file.");
  const opfDir = dirname(opfPath);

  // 2. Metadata.
  const meta = opf.querySelector("metadata");
  const title =
    text(meta?.querySelector("title")) || "Untitled book";
  const author = text(meta?.querySelector("creator")) || undefined;
  const language = text(meta?.querySelector("language")) || undefined;

  // 3. Manifest: id -> { href (zip path), type, properties }.
  const manifest = new Map<
    string,
    { path: string; type: string; properties: string }
  >();
  const byPath = new Map<string, string>(); // zip path -> id
  for (const item of opf.querySelectorAll("manifest > item")) {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    if (!id || !href) continue;
    const path = resolvePath(opfDir, href);
    manifest.set(id, {
      path,
      type: item.getAttribute("media-type") ?? "",
      properties: item.getAttribute("properties") ?? "",
    });
    byPath.set(path, id);
  }

  // 4. Spine: ordered reading list of manifest item ids.
  const spineIds = [...opf.querySelectorAll("spine > itemref")]
    .map((ref) => ref.getAttribute("idref"))
    .filter((id): id is string => Boolean(id));

  // 5. Build chapters from spine XHTML docs, collecting referenced images.
  const resources: Record<string, Blob> = {};
  const collectImage = (chapterDir: string, rawSrc: string): string | undefined => {
    const path = resolvePath(chapterDir, rawSrc);
    const bytes = files[path];
    if (!bytes) return undefined;
    if (!resources[path]) resources[path] = blobFor(path, bytes);
    return path;
  };

  const chapters: Chapter[] = [];
  const indexByPath = new Map<string, number>(); // chapter path -> chapter index
  for (const id of spineIds) {
    const item = manifest.get(id);
    if (!item || !XHTML_TYPES.has(item.type)) continue;
    const html = readText(item.path);
    if (!html) continue;
    const doc = parser.parseFromString(html, "application/xhtml+xml");
    // A malformed XHTML doc yields a <parsererror>; retry as lenient HTML.
    const root = doc.querySelector("parsererror")
      ? parser.parseFromString(html, "text/html")
      : doc;
    const chapterDir = dirname(item.path);
    const blocks: ContentBlock[] = xhtmlToBlocks(root, {
      resolveImage: (src) => collectImage(chapterDir, src),
    });
    if (blocks.length === 0) continue;
    indexByPath.set(item.path, chapters.length);
    chapters.push({ href: item.path, blocks });
  }

  if (chapters.length === 0) {
    throw new Error("Could not extract any readable text from this EPUB.");
  }

  // 6. Titles from the TOC (EPUB3 nav, else EPUB2 NCX), mapped onto chapters.
  applyToc(opf, manifest, readXml, indexByPath, chapters);

  // 7. Cover image.
  const cover = findCover(opf, manifest, files);

  return { title, author, language, cover, chapters, resources };
}

/** Map TOC entries (nav doc or NCX) onto chapter titles by href. */
function applyToc(
  opf: Document,
  manifest: Map<string, { path: string; type: string; properties: string }>,
  readXml: (path: string) => Document | undefined,
  indexByPath: Map<string, number>,
  chapters: Chapter[],
): void {
  const setTitle = (resolvedPath: string, label: string) => {
    const base = resolvedPath.split("/").pop() ?? resolvedPath;
    const idx =
      indexByPath.get(resolvedPath) ??
      [...indexByPath.entries()].find(([p]) => p.split("/").pop() === base)?.[1];
    if (idx != null && !chapters[idx].title) chapters[idx].title = label;
  };

  // EPUB3 nav document.
  const navItem = [...manifest.values()].find((m) =>
    m.properties.split(/\s+/).includes("nav"),
  );
  if (navItem) {
    const nav = readXml(navItem.path);
    const navDir = dirname(navItem.path);
    const tocNav =
      nav?.querySelector('nav[*|type="toc"]') ?? nav?.querySelector("nav");
    for (const a of tocNav?.querySelectorAll("a[href]") ?? []) {
      const href = a.getAttribute("href");
      const label = text(a);
      if (href && label) setTitle(resolvePath(navDir, stripAnchor(href)), label);
    }
    if (chapters.some((c) => c.title)) return;
  }

  // EPUB2 NCX.
  const ncxItem = [...manifest.values()].find(
    (m) => m.type === "application/x-dtbncx+xml",
  );
  if (ncxItem) {
    const ncx = readXml(ncxItem.path);
    const ncxDir = dirname(ncxItem.path);
    for (const point of ncx?.querySelectorAll("navPoint") ?? []) {
      const href = point.querySelector("content")?.getAttribute("src");
      const label = text(point.querySelector("navLabel > text"));
      if (href && label) setTitle(resolvePath(ncxDir, stripAnchor(href)), label);
    }
  }
}

/** Locate the cover image via the OPF cover meta or a cover-image property. */
function findCover(
  opf: Document,
  manifest: Map<string, { path: string; type: string; properties: string }>,
  files: Record<string, Uint8Array>,
): Blob | undefined {
  let item =
    [...manifest.values()].find((m) =>
      m.properties.split(/\s+/).includes("cover-image"),
    ) ?? undefined;
  if (!item) {
    const coverId = opf
      .querySelector('metadata > meta[name="cover"]')
      ?.getAttribute("content");
    if (coverId) item = manifest.get(coverId);
  }
  if (!item) return undefined;
  const bytes = files[item.path];
  return bytes ? blobFor(item.path, bytes) : undefined;
}

// --- small helpers -------------------------------------------------------

function text(el: Element | null | undefined): string {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

function blobFor(path: string, bytes: Uint8Array): Blob {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const copy = bytes.slice(); // detach from the unzip buffer
  return new Blob([copy], { type: MIME_BY_EXT[ext] ?? "application/octet-stream" });
}

function dirname(path: string): string {
  const i = path.lastIndexOf("/");
  return i === -1 ? "" : path.slice(0, i);
}

function stripAnchor(href: string): string {
  return href.split("#")[0].split("?")[0];
}

/** Join a base dir + (possibly relative, URL-encoded) href into a zip path. */
function resolvePath(baseDir: string, href: string): string {
  let raw = stripAnchor(href);
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* keep raw */
  }
  const segments = (baseDir ? `${baseDir}/${raw}` : raw).split("/");
  const out: string[] = [];
  for (const seg of segments) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return out.join("/");
}
