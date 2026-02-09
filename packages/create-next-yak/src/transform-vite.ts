import { parseModule, generateCode } from "magicast";
import { addVitePlugin } from "magicast/helpers";

const DEFAULT_CONFIG = `import { defineConfig } from "vite";
import { viteYak } from "next-yak/vite";

export default defineConfig({
  plugins: [viteYak()],
});
`;

/**
 * Transforms a Vite config file to add the viteYak plugin.
 * Returns null if no config file exists (caller should create one).
 */
export function transformViteConfig(code: string): string {
  const mod = parseModule(code);

  addVitePlugin(mod, {
    from: "next-yak/vite",
    imported: "viteYak",
    constructor: "viteYak",
  });

  return generateCode(mod).code;
}

export function getDefaultViteConfig(): string {
  return DEFAULT_CONFIG;
}
