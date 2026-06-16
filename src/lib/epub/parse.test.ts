import { describe, it, expect } from "vitest";
import { zipSync, strToU8 } from "fflate";
import { parseEpub } from "./parse";

const CONTAINER = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

const OPF = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test Book</dc:title>
    <dc:creator>Jane Author</dc:creator>
    <dc:language>en</dc:language>
    <meta name="cover" content="cover-img"/>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch2" href="text/ch2.xhtml" media-type="application/xhtml+xml"/>
    <item id="cover-img" href="images/cover.png" media-type="image/png" properties="cover-image"/>
  </manifest>
  <spine>
    <itemref idref="ch1"/>
    <itemref idref="ch2"/>
  </spine>
</package>`;

const NAV = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <body>
    <nav epub:type="toc">
      <ol>
        <li><a href="ch1.xhtml">The Beginning</a></li>
        <li><a href="text/ch2.xhtml">The End</a></li>
      </ol>
    </nav>
  </body>
</html>`;

const CH1 = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head><title>Ch1</title></head>
  <body>
    <h1>Heading One</h1>
    <p>Hello world from chapter one.</p>
  </body>
</html>`;

// In a subfolder so its relative image href must be resolved against text/.
const CH2 = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head><title>Ch2</title></head>
  <body>
    <p>The second chapter has a picture.</p>
    <p><img src="../images/pic.png" alt="A picture"/></p>
  </body>
</html>`;

function buildEpub(): ArrayBuffer {
  const zipped = zipSync({
    mimetype: strToU8("application/epub+zip"),
    "META-INF/container.xml": strToU8(CONTAINER),
    "OEBPS/content.opf": strToU8(OPF),
    "OEBPS/nav.xhtml": strToU8(NAV),
    "OEBPS/ch1.xhtml": strToU8(CH1),
    "OEBPS/text/ch2.xhtml": strToU8(CH2),
    "OEBPS/images/cover.png": new Uint8Array([137, 80, 78, 71, 1, 2, 3, 4]),
    "OEBPS/images/pic.png": new Uint8Array([137, 80, 78, 71, 5, 6, 7, 8]),
  });
  return zipped.buffer.slice(
    zipped.byteOffset,
    zipped.byteOffset + zipped.byteLength,
  ) as ArrayBuffer;
}

describe("parseEpub", () => {
  it("extracts metadata, chapters, TOC titles, images, and cover", () => {
    const book = parseEpub(buildEpub());

    expect(book.title).toBe("Test Book");
    expect(book.author).toBe("Jane Author");
    expect(book.language).toBe("en");

    expect(book.chapters).toHaveLength(2);
    expect(book.chapters[0].title).toBe("The Beginning");
    expect(book.chapters[1].title).toBe("The End");

    expect(book.chapters[0].blocks).toEqual([
      { type: "heading", level: 2, text: "Heading One" },
      { type: "paragraph", text: "Hello world from chapter one." },
    ]);

    // The ch2 image href "../images/pic.png" resolves against OEBPS/text/.
    const imageBlock = book.chapters[1].blocks.find((b) => b.type === "image");
    expect(imageBlock).toMatchObject({
      type: "image",
      src: "OEBPS/images/pic.png",
      alt: "A picture",
    });
    expect(book.resources["OEBPS/images/pic.png"]).toBeInstanceOf(Blob);

    expect(book.cover).toBeInstanceOf(Blob);
    expect(book.cover!.size).toBeGreaterThan(0);
  });

  it("throws on a non-EPUB archive", () => {
    const zipped = zipSync({ "hello.txt": strToU8("not an epub") });
    const buf = zipped.buffer.slice(
      zipped.byteOffset,
      zipped.byteOffset + zipped.byteLength,
    ) as ArrayBuffer;
    expect(() => parseEpub(buf)).toThrow(/container\.xml/);
  });
});
