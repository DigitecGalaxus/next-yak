import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type { YakAddonOptions } from "./preset.js";

/**
 * Returns the preset paths for Storybook
 * This tells Storybook where to find our viteFinal/webpackFinal configuration
 */
export function presets() {
  const currentDir = dirname(fileURLToPath(import.meta.url)); // esm only
  return [join(currentDir, "preset.js")];
}
