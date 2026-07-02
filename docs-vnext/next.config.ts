import type { NextConfig } from "next";
import { withYak } from "next-yak/withYak";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Fully static site: no server at runtime. The search index is prerendered to
  // a static asset (see app/api/search/route.ts) and queried in the browser.
  output: "export",
  images: { unoptimized: true },
  ...(basePath ? { basePath } : {}),
};

const config = withYak(withMDX(nextConfig));

/**
 * Keep next-yak's Turbopack loader off compiled Markdown/MDX — a docs-only concern.
 *
 * next-yak registers its loader for `*.{js,jsx,…}`. fumadocs compiles `.md/.mdx` and marks the
 * output `as: "*.js"` (see `createMDX`), so that generated JS gets pulled through next-yak too.
 * That's harmless for a normal app, but THESE docs are *about* next-yak: every page is full of
 * `from "next-yak"` code samples and even shown `import "data:text/css;base64,…"` output, which the
 * extractor mistakes for its own placeholder and corrupts. Rather than change the shared loader,
 * we re-key next-yak's rule to drop plain `.js` (MDX's `as` target); we only ever author next-yak
 * styles in `.ts`/`.tsx`, so nothing real stops being transformed.
 */
const rules = (config as NextConfig).turbopack?.rules;
if (rules) {
  for (const [glob, rule] of Object.entries(rules)) {
    const loaders = (rule as { loaders?: Array<{ loader?: string }> }).loaders;
    const isYakRule =
      Array.isArray(loaders) &&
      loaders.some((l) => typeof l?.loader === "string" && l.loader.includes("turbo-loader"));
    if (isYakRule && glob.includes("{js,")) {
      rules[glob.replace("{js,", "{")] = rule; // e.g. "*.{js,jsx,…}" → "*.{jsx,…}"
      delete rules[glob];
    }
  }
}

export default config;
