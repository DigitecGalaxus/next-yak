import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { viteYak } from "next-yak/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      rsc: {
        enabled: true,
      },
    }),
    viteYak(),
    react(),
    rsc(),
  ],
});
