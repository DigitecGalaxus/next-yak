import { qwikVite } from "@qwik.dev/core/optimizer";
import { qwikRouter } from "@qwik.dev/router/vite";
import { yak } from "@yak/qwik/vite";
import { defineConfig } from "vite";

// The recommended qwik setup: the router serves the pages in dev (with the
// css of each route and hmr) and in preview. One route per case under
// src/routes/<case>/, expanded from the [case-name] template.

// Two-mode e2e: opt out of static folding only when YAK_E2E_FOLD_STATIC is
// "false". Otherwise pass no foldStatic key so the config stays inert.
const yakOptions = process.env.YAK_E2E_FOLD_STATIC === "false" ? { foldStatic: false } : {};

export default defineConfig({
  // yak first: it must see the source before qwik's optimizer splits it
  plugins: [yak(yakOptions), qwikRouter(), qwikVite()],
});
