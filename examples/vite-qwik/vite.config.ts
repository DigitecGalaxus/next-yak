import { qwikVite } from "@qwik.dev/core/optimizer";
import { qwikRouter } from "@qwik.dev/router/vite";
import { yak } from "@yak/qwik/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // yak first: it must see the source before qwik's optimizer splits it
  // the server build lands under dist like the client build, so one ignore rule covers both
  plugins: [yak(), qwikRouter(), qwikVite({ ssr: { outDir: "dist/server" } })],
});
