import react from "@vitejs/plugin-react-swc";
import { viteYak } from "next-yak/vite";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  plugins: [react(), viteYak()],
  css: {},
  environments: {
    ssr: {
      build: {
        outDir: "dist/server",
        rollupOptions: {
          input: resolve(__dirname, "src/main.tsx"),
        },
      },
    },
  },
  builder: {
    async buildApp(builder) {
      await builder.build(builder.environments.client!);
      await builder.build(builder.environments.ssr!);
    },
  },
});
