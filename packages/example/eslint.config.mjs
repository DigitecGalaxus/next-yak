import { FlatCompat } from "@eslint/eslintrc";
import yakPlugin from "eslint-plugin-yak";
import { defineConfig } from "eslint/config";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

export default defineConfig([
  {
    ignores: [
      ".next/**",
      ".swc/**",
      "public/**",
      "next.config.mjs",
      "postcss.config.js",
      "jest.config.cjs",
    ],
  },
  yakPlugin.configs.recommended,
  ...compat.config({
    extends: ["next", "next/typescript"],
    rules: {
      "no-var": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  }),
]);
