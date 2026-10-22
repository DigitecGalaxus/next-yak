// A script instead of app/opengraph-image.tsx: under `output: "export"` that convention
// writes an extensionless file, which static hosts serve as application/octet-stream
import { createRequire } from "node:module";
import { readFile, readdir, writeFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { Card, GITHUB_SIZE, SIZE } from "../src/og/card.ts";
import { cardFor, fixedKeys } from "../src/og/cards.ts";

const require = createRequire(import.meta.url);
const { ImageResponse } = require("next/og") as typeof import("next/og");

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const OG = join(root, "src/og");
const OUT = join(root, "public/og");

// WhatsApp and some chat apps skip preview images above about 600 KB
const MAX_BYTES = 500 * 1024;

// The frontmatter holds only plain YAML scalars
function frontmatter(text: string): Record<string, string> {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!block) return {};
  const out: Record<string, string> = {};
  for (const line of block[1].split("\n")) {
    const m = /^([a-zA-Z_]+):\s*(.*)$/.exec(line);
    if (m) out[m[1]] = m[2].trim().replace(/^["'](.*)["']$/, "$1");
  }
  return out;
}

const pagesIn = async (dir: string, prefix: string) => {
  const files = (await readdir(join(root, dir))).filter((f) => f.endsWith(".mdx"));
  const pages = await Promise.all(
    files.sort().map(async (f) => {
      const fm = frontmatter(await readFile(join(root, dir, f), "utf8"));
      const key = `${prefix}-${f.replace(/\.mdx$/, "")}`;
      return {
        key,
        card: cardFor(key, { ...fm, title: fm.title ?? f.replace(/\.mdx$/, "") }),
        draft: fm.draft === "true",
      };
    }),
  );
  // A draft card in public/og would ship with the site and leak the draft's title
  return pages.filter((page) => !page.draft);
};

const font = (file: string, weight: 400 | 500 | 700 | 800, name = "Bricolage") =>
  readFile(join(OG, "fonts", file)).then((data) => ({
    name,
    data,
    weight,
    style: "normal" as const,
  }));

const fonts = await Promise.all([
  font("BricolageGrotesque-Medium.ttf", 500),
  font("BricolageGrotesque-Bold.ttf", 700),
  font("BricolageGrotesque-ExtraBold.ttf", 800),
  // The code on the playground card, subset to printable ASCII
  font("JetBrainsMono-Regular.ttf", 400, "JetBrains Mono"),
]);

const dataUrl = (bytes: Buffer, type: string) => `data:${type};base64,${bytes.toString("base64")}`;

const poses = Object.fromEntries(
  await Promise.all(
    ["excited", "guide", "leap"].map(async (name) => [
      name,
      dataUrl(await readFile(join(OG, "poses", `${name}.png`)), "image/png"),
    ]),
  ),
);

// Satori needs the size of each image, so read the aspect ratio off the viewBox
const logoFiles = (await readdir(join(OG, "logos"))).filter((file) => file.endsWith(".svg"));
const logos = Object.fromEntries(
  await Promise.all(
    logoFiles.map(async (file) => {
      const svg = await readFile(join(OG, "logos", file));
      const viewBox = /viewBox="([^"]+)"/.exec(svg.toString());
      if (!viewBox) throw new Error(`[og] logos/${file} has no viewBox`);
      const [, , width, height] = viewBox[1]
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      if (!(width > 0 && height > 0)) throw new Error(`[og] logos/${file} has a bad viewBox`);
      return [
        file.replace(/\.svg$/, ""),
        { src: dataUrl(svg, "image/svg+xml"), ratio: width / height },
      ];
    }),
  ),
);

const cards = [
  ...fixedKeys.map((key) => ({ key, card: cardFor(key) })),
  ...(await pagesIn("src/content/docs", "docs")),
  ...(await pagesIn("src/content/blog", "blog")),
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const { key, card } of cards) {
  const size = card.template === "github" ? GITHUB_SIZE : SIZE;
  const res = new ImageResponse(Card({ card, poses, logos }), { ...size, fonts });
  // Satori writes uncompressed 24-bit PNGs. A 256-color palette keeps them PNG, which every
  // link preview reads, at about a quarter of the size
  const png = await sharp(Buffer.from(await res.arrayBuffer()))
    .png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 })
    .toBuffer();
  if (png.length > MAX_BYTES) throw new Error(`[og] ${key}.png is ${png.length} bytes`);
  await writeFile(join(OUT, `${key}.png`), png);
}

console.log(`[og] ${cards.length} cards -> public/og`);
