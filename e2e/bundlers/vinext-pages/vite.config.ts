import { viteYak } from "next-yak/vite";
import vinext from "vinext";
import { defineConfig } from "vite";

// vinext reimplements the Next.js API surface on Vite and merges this config
// with its own; viteYak adds next-yak's CSS-in-JS transform to the same Vite
// pipeline (Pages Router, no RSC). The port is passed via the `vinext` CLI
// (`-p 3006`) in package.json, which is authoritative for its dev/start server.
export default defineConfig({
  plugins: [vinext(), viteYak()],
});
