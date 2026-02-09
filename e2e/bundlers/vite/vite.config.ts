import react from "@vitejs/plugin-react-swc";
import { viteYak } from "next-yak/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), viteYak()],
});
