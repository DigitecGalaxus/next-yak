import yakPlugin from "eslint-plugin-yak";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintNextPlugin from "@next/eslint-plugin-next";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  yakPlugin.configs.recommended,
  ...nextTs,
  {
    plugins: {
      next: eslintNextPlugin,
    },
    settings: {
      next: {
        rootDir: "packages/example/",
      },
    },
  },
  {
    rules: {
      "no-var": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".swc/**",
    "public/**",
    "next.config.mjs",
    "postcss.config.js",
    "jest.config.cjs",
    "next-env.d.ts",
  ]),
]);
