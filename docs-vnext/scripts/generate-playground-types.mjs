/**
 * Writes the declarations for the playground's Monaco editor, one file per framework:
 * public/playground/types/react.json and public/playground/types/solid.json.
 */
import { createRequire } from "node:module";
import { existsSync, realpathSync } from "node:fs";
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "../public/playground/types");

/** The folder of an installed package. Some packages do not export ./package.json, so it is found by its lookup paths. */
function packageDir(name, from = require) {
  for (const base of from.resolve.paths(name) ?? []) {
    if (existsSync(join(base, name, "package.json"))) return realpathSync(join(base, name));
  }
  throw new Error(`Cannot find the package ${name}`);
}

/** Adds every .d.ts file below `dir` as node_modules/<name>/<path>. */
async function addTree(types, name, dir) {
  for (const entry of await readdir(dir, { recursive: true })) {
    if (!entry.endsWith(".d.ts")) continue;
    types[`node_modules/${name}/${entry}`] = await readFile(join(dir, entry), "utf8");
  }
}

/** A root entry that points at declarations in a subfolder, as the package.json `types` field does. */
function addEntry(types, name, file, target) {
  types[`node_modules/${name}/${file}`] = `export * from "./${target}";\n`;
}

async function reactTypes() {
  const reactDir = packageDir("@types/react");
  const csstypeDir = packageDir("csstype", createRequire(join(reactDir, "index.d.ts")));
  const yakDist = join(packageDir("next-yak"), "dist");

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
  return types;
}

async function solidTypes() {
  const solidDir = packageDir("solid-js");
  const webDir = packageDir("@solidjs/web");
  const signalsDir = packageDir("@solidjs/signals", createRequire(join(solidDir, "package.json")));
  const csstypeDir = packageDir("csstype", createRequire(join(webDir, "package.json")));
  const yakDist = join(packageDir("@yak/solid"), "dist");

  const types = {};
  await addTree(types, "solid-js/types", join(solidDir, "types"));
  addEntry(types, "solid-js", "index.d.ts", "types/index.js");
  await addTree(types, "@solidjs/web/types", join(webDir, "types"));
  addEntry(types, "@solidjs/web", "index.d.ts", "types/index.js");
  addEntry(types, "@solidjs/web", "jsx-runtime.d.ts", "types/jsx.js");
  await addTree(types, "@solidjs/signals/types", join(signalsDir, "dist/types"));
  addEntry(types, "@solidjs/signals", "index.d.ts", "types/index.js");
  addEntry(types, "@solidjs/signals", "attribution.d.ts", "types/attribution.js");
  types["node_modules/csstype/index.d.ts"] = await readFile(join(csstypeDir, "index.d.ts"), "utf8");
  types["node_modules/@yak/solid/index.d.ts"] = await readFile(join(yakDist, "index.d.ts"), "utf8");
  return types;
}

await mkdir(OUT, { recursive: true });
for (const [framework, collect] of Object.entries({ react: reactTypes, solid: solidTypes })) {
  const types = await collect();
  await writeFile(join(OUT, `${framework}.json`), JSON.stringify(types));
  console.log(`playground types: ${framework}, ${Object.keys(types).length} files`);
}
