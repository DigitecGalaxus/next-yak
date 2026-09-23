/**
 * Render one share card per page into public/og/.
 *
 * Why a script and not app/opengraph-image.tsx: under `output: "export"` the file
 * convention writes an extensionless file, and a plain static host serves that as
 * application/octet-stream. A social crawler then skips the card. Real .png files carry
 * the right content type on any host.
 *
 * `next/og` ships with Next, so this adds no dependency. It is CommonJS, hence createRequire.
 */
import { createRequire } from "node:module";
import { readFile, readdir, writeFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Card, SIZE } from "../src/og/card.mjs";

const require = createRequire(import.meta.url);
const { ImageResponse } = require("next/og");

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const OUT = join(root, "public/og");

/** The frontmatter is plain YAML scalars, so a line reader is enough. No parser needed. */
function frontmatter(text) {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!block) return {};
  const out = {};
  for (const line of block[1].split("\n")) {
    const m = /^([a-zA-Z_]+):\s*(.*)$/.exec(line);
    if (m) out[m[1]] = m[2].trim().replace(/^["'](.*)["']$/, "$1");
  }
  return out;
}

/** satori has no line clamp, so a long description gets cut here instead. */
const trim = (s, max = 78) =>
  !s ? "" : s.length <= max ? s : `${s.slice(0, s.lastIndexOf(" ", max))}…`;

const font = (file, name, weight) =>
  readFile(join(root, "src/og/fonts", file)).then((data) => ({
    name,
    data,
    weight,
    style: "normal",
  }));

const pagesIn = async (dir, section, prefix) => {
  const files = (await readdir(join(root, dir))).filter((f) => f.endsWith(".mdx"));
  return Promise.all(
    files.sort().map(async (f) => {
      const fm = frontmatter(await readFile(join(root, dir, f), "utf8"));
      const title = fm.title ?? f.replace(/\.mdx$/, "");
      return {
        key: `${prefix}-${f.replace(/\.mdx$/, "")}`,
        section,
        title,
        // A 3-line title leaves room for one line of blurb, not two.
        blurb: trim(fm.description, title.length > 30 ? 46 : 78),
      };
    }),
  );
};

const fonts = await Promise.all([
  font("BricolageGrotesque-ExtraBold.ttf", "Bricolage Grotesque", 800),
  font("HankenGrotesk-Regular.ttf", "Hanken Grotesk", 400),
  font("HankenGrotesk-SemiBold.ttf", "Hanken Grotesk", 600),
  font("HankenGrotesk-Black.ttf", "Hanken Grotesk", 900),
]);

const mascotBytes = await readFile(join(root, "src/og/yak-mascot.png"));
const mascot = `data:image/png;base64,${mascotBytes.toString("base64")}`;

const cards = [
  {
    key: "home",
    home: true,
    section: "zero-runtime CSS-in-JS",
    title: "yak",
    blurb: "Write styled-components syntax. Ship no runtime.",
  },
  {
    key: "blog",
    section: "Blog",
    title: "Blog",
    blurb: "Notes on yak: the rename, the runtimes, and what is coming.",
  },
  {
    key: "playground",
    section: "Playground",
    title: "Playground",
    blurb: "An interactive playground is on the way.",
  },
  ...(await pagesIn("src/content/docs", "Documentation", "docs")),
  ...(await pagesIn("src/content/blog", "Blog", "blog")),
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const card of cards) {
  const res = new ImageResponse(Card({ ...card, mascot }), { ...SIZE, fonts });
  await writeFile(join(OUT, `${card.key}.png`), Buffer.from(await res.arrayBuffer()));
}

console.log(`[og] ${cards.length} cards -> public/og`);
