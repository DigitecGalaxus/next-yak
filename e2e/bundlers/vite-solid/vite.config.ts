import { readdirSync } from "node:fs";
import { basename, resolve } from "node:path";
import solid from "@solidjs/vite-plugin";
import { yak } from "@yak/solid/vite";
import { defineConfig } from "vite";

// One page per case: the client build takes every .html, the server build
// every entries/*.server.tsx. Each page carries only its own CSS.
const htmlEntries: Record<string, string> = {};
const serverEntries: Record<string, string> = {};
for (const file of readdirSync(__dirname)) {
  if (file.endsWith(".html")) htmlEntries[basename(file, ".html")] = resolve(__dirname, file);
}
for (const file of readdirSync(resolve(__dirname, "entries"))) {
  if (file.endsWith(".server.tsx")) {
    serverEntries[basename(file, ".server.tsx")] = resolve(__dirname, "entries", file);
  }
}

// Two-mode e2e: opt out of static folding only when YAK_E2E_FOLD_STATIC is
// "false". Otherwise pass no foldStatic key so the config stays inert.
const yakOptions = process.env.YAK_E2E_FOLD_STATIC === "false" ? { foldStatic: false } : {};

export default defineConfig(({ isSsrBuild }) => ({
  // yak first: it must see the source before the JSX is compiled
  plugins: [yak(yakOptions), solid({ ssr: true })],
  // one copy of Solid on the server, or its hydration keys drift apart
  resolve: { dedupe: ["solid-js", "@solidjs/web", "@solidjs/signals"] },
  ssr: { noExternal: ["@yak/solid"] },
  build: isSsrBuild
    ? { ssr: true, outDir: "dist/server", rollupOptions: { input: serverEntries } }
    : { outDir: "dist/client", rollupOptions: { input: htmlEntries } },
}));
