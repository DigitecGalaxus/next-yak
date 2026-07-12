import { viteYakSolid } from "@yak/solid/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  // viteYakSolid is enforce: "pre" and therefore always runs before
  // vite-plugin-solid - css``/styled`` and the css prop are compiled away
  // before Solid's JSX compiler sees the file
  plugins: [viteYakSolid(), solid()],
});
