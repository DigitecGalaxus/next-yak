/**
 * Storybook addon for next-yak CSS-in-JS
 *
 * @example
 * ```ts
 * // .storybook/main.ts
 * const config: StorybookConfig = {
 *   addons: ['storybook-addon-yak'],
 *   // ...
 * };
 * ```
 *
 * @example
 * ```ts
 * // .storybook/main.ts - with options
 * const config: StorybookConfig = {
 *   addons: [
 *     {
 *       name: 'storybook-addon-yak',
 *       options: {
 *         contextPath: './yak.context.ts',
 *       }
 *     }
 *   ],
 *   // ...
 * };
 * ```
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type { YakAddonOptions } from "./preset.js";

/**
 * Returns the preset paths for Storybook
 * This tells Storybook where to find our viteFinal/webpackFinal configuration
 */
export function presets() {
  // ESM-only: use import.meta.url
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return [join(currentDir, "preset.js")];
}
