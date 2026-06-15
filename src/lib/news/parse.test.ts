import { describe, it, expect } from "vitest";
import { parseFeed, toPlainText, decodeEntities } from "./parse";

const ctx = { source: "Test", category: "top", fetchedAt: 1_700_000_000_000 };

describe("decodeEntities", () => {
  it("decodes named and numeric entities", () => {
    expect(decodeEntities("Tom &amp; Jerry")).toBe("Tom & Jerry");
    expect(decodeEntities("5 &lt; 10 &gt; 3")).toBe("5 < 10 > 3");
    expect(decodeEntities("caf&#233;")).toBe("café");
    expect(decodeEntities("&#x2014;")).toBe("—");
  });
});

describe("toPlainText", () => {
  it("strips CDATA, tags, and collapses whitespace", () => {
    const input = "<![CDATA[<p>Hello   <b>world</b></p>]]>";
    expect(toPlainText(input)).toBe("Hello world");
  });

  it("strips entity-escaped HTML (e.g. The Guardian)", () => {
    const input =
      "&lt;p&gt;Prime minister announces ban&lt;/p&gt;&lt;ul&gt;&lt;li&gt;&lt;a href=&quot;https://x.com&quot;&gt;link&lt;/a&gt;&lt;/li&gt;&lt;/ul&gt;";
    expect(toPlainText(input)).toBe("Prime minister announces ban link");
  });
});

describe("parseFeed (RSS 2.0)", () => {
  const rss = `<?xml version="1.0"?>
  <rss version="2.0"><channel>
    <title>Channel</title>
    <item>
      <title>First &amp; Foremost</title>
      <link>https://example.com/a</link>
      <description><![CDATA[<p>Summary <b>one</b>.</p>]]></description>
      <pubDate>Tue, 14 Nov 2023 09:00:00 GMT</pubDate>
      <guid>guid-a</guid>
    </item>
    <item>
      <title>Second</title>
      <link>https://example.com/b</link>
      <description>Plain summary two.</description>
    </item>
  </channel></rss>`;

  it("extracts items with decoded titles and clean summaries", () => {
    const out = parseFeed(rss, ctx);
    expect(out).toHaveLength(2);
    expect(out[0].title).toBe("First & Foremost");
    expect(out[0].summary).toBe("Summary one.");
    expect(out[0].link).toBe("https://example.com/a");
    expect(out[0].id).toBe("guid-a");
    expect(out[0].source).toBe("Test");
    expect(out[0].publishedAt).toBe(Date.parse("Tue, 14 Nov 2023 09:00:00 GMT"));
  });

  it("falls back to fetchedAt when no date is present", () => {
    const out = parseFeed(rss, ctx);
    expect(out[1].publishedAt).toBe(ctx.fetchedAt);
    expect(out[1].id).toBe("https://example.com/b");
  });
});

describe("parseFeed (Atom)", () => {
  const atom = `<?xml version="1.0"?>
  <feed xmlns="http://www.w3.org/2005/Atom">
    <entry>
      <title>Atom Title</title>
      <link rel="alternate" href="https://example.com/atom"/>
      <summary>Atom summary text.</summary>
      <id>atom-1</id>
      <published>2023-11-14T09:00:00Z</published>
    </entry>
  </feed>`;

  it("parses entry, alternate link, and published date", () => {
    const out = parseFeed(atom, ctx);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe("Atom Title");
    expect(out[0].link).toBe("https://example.com/atom");
    expect(out[0].summary).toBe("Atom summary text.");
    expect(out[0].id).toBe("atom-1");
    expect(out[0].publishedAt).toBe(Date.parse("2023-11-14T09:00:00Z"));
  });
});

describe("parseFeed (robustness)", () => {
  it("skips items without a title and returns [] for junk", () => {
    expect(parseFeed("not xml at all", ctx)).toEqual([]);
    const partial = `<rss><channel><item><link>https://x.com</link></item></channel></rss>`;
    expect(parseFeed(partial, ctx)).toEqual([]);
  });
});
