import { yak } from "@yak/solid/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [yak(), solid()],
});
