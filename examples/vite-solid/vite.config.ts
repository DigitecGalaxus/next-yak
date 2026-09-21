import { yak } from "@yak/solid/vite";
import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  plugins: [yak(), solid()],
});
