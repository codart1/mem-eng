import { describe, it, expect } from "vitest";
import { xhtmlToBlocks } from "./xhtml-to-blocks";

function parse(inner: string): Document {
  return new DOMParser().parseFromString(
    `<html><body>${inner}</body></html>`,
    "text/html",
  );
}

describe("xhtmlToBlocks", () => {
  it("maps headings, paragraphs, quotes, and lists", () => {
    const doc = parse(`
      <h1>Chapter One</h1>
      <p>First paragraph.</p>
      <blockquote>A quote.</blockquote>
      <ol><li>one</li><li>two</li></ol>
    `);
    expect(xhtmlToBlocks(doc, { resolveImage: () => undefined })).toEqual([
      { type: "heading", level: 2, text: "Chapter One" },
      { type: "paragraph", text: "First paragraph." },
      { type: "quote", text: "A quote." },
      { type: "list", ordered: true, items: ["one", "two"] },
    ]);
  });

  it("collapses whitespace and skips empty nodes", () => {
    const doc = parse(`<p>  spaced   out\n text </p><p></p>`);
    expect(xhtmlToBlocks(doc, { resolveImage: () => undefined })).toEqual([
      { type: "paragraph", text: "spaced out text" },
    ]);
  });

  it("resolves images via the callback and skips unresolved ones", () => {
    const doc = parse(
      `<p><img src="images/a.png" alt="Alt"/></p><p><img src="missing.png"/></p>`,
    );
    const blocks = xhtmlToBlocks(doc, {
      resolveImage: (s) => (s.includes("a.png") ? "OEBPS/images/a.png" : undefined),
    });
    expect(blocks).toMatchObject([
      { type: "image", src: "OEBPS/images/a.png", alt: "Alt" },
    ]);
  });

  it("recurses into wrapper divs instead of flattening to one block", () => {
    const doc = parse(`<div><p>One.</p><p>Two.</p></div>`);
    expect(xhtmlToBlocks(doc, { resolveImage: () => undefined })).toEqual([
      { type: "paragraph", text: "One." },
      { type: "paragraph", text: "Two." },
    ]);
  });
});
