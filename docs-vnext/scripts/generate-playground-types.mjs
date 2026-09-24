/**
 * Write the type files the playground editor needs to public/playground/types.json.
 *
 * Monaco checks the code in the browser, so it needs the React and yak declarations as text.
 * A JSON file in public/ keeps them out of every JavaScript bundle: only the playground
 * fetches it, and a static host serves it under the base path like any other asset.
 *
 * Each key is the path Monaco sees. The yak declarations go in twice, once for `next-yak`
 * and once for its new name `@yak/react`, so both imports get types.
 */
import { createRequire } from "node:module";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "../public/playground");

const reactDir = dirname(require.resolve("@types/react/package.json"));
const csstypeDir = dirname(createRequire(join(reactDir, "index.d.ts")).resolve("csstype/package.json"));
// next-yak exports no ./package.json, so find dist/ from the main entry, which lives in it
const yakDist = dirname(require.resolve("next-yak"));

const files = {
  "node_modules/@types/react/index.d.ts": join(reactDir, "index.d.ts"),
  "node_modules/@types/react/global.d.ts": join(reactDir, "global.d.ts"),
  "node_modules/@types/react/jsx-runtime.d.ts": join(reactDir, "jsx-runtime.d.ts"),
  "node_modules/csstype/index.d.ts": join(csstypeDir, "index.d.ts"),
  "node_modules/next-yak/index.d.ts": join(yakDist, "index.d.ts"),
  "node_modules/next-yak/jsx-runtime.d.ts": join(yakDist, "jsx-runtime.d.ts"),
  "node_modules/@yak/react/index.d.ts": join(yakDist, "index.d.ts"),
  "node_modules/@yak/react/jsx-runtime.d.ts": join(yakDist, "jsx-runtime.d.ts"),
};

const types = {};
for (const [path, source] of Object.entries(files)) {
  types[path] = await readFile(source, "utf8");
}

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, "types.json"), JSON.stringify(types));
console.log(`playground types: ${Object.keys(types).length} files`);
