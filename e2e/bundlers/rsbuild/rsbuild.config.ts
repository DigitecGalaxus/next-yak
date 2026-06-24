import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginYak } from "next-yak/rsbuild";

// One entry per case (entries/<case-name>.tsx). Rsbuild emits a <case-name>.html
// page for each, served at /<case-name>.html — matching the playwright urlPattern.
const entriesDir = resolve(__dirname, "entries");
const entry: Record<string, string> = {};
for (const file of readdirSync(entriesDir)) {
  if (file.endsWith(".tsx")) {
    entry[file.replace(/\.tsx$/, "")] = resolve(entriesDir, file);
  }
}

export default defineConfig({
  source: { entry },
  server: { port: 5273 },
  plugins: [pluginReact(), pluginYak()],
});
