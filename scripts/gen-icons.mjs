// Rasterize public/icon.svg into the PNG sizes the web manifest needs.
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = await readFile(join(root, "public", "icon.svg"));
const outDir = join(root, "public", "icons");
await mkdir(outDir, { recursive: true });

const targets = [
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
  { size: 180, name: "apple-touch-icon.png" },
];

for (const { size, name } of targets) {
  const png = await sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();
  await writeFile(join(outDir, name), png);
  console.log(`wrote icons/${name} (${size}x${size})`);
}
