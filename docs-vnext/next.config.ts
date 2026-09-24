import type { NextConfig } from "next";
import { withYak } from "next-yak/withYak";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  ...(basePath ? { basePath } : {}),
};

const config = withYak(withMDX(nextConfig));

// next-yak's Turbopack rule matches `*.{js,…}`, and fumadocs emits compiled MDX `as: "*.js"`.
// The docs contain next-yak code samples that the extractor then corrupts, so drop `js` from
// the rule. All real styles live in .ts/.tsx.
const rules = (config as NextConfig).turbopack?.rules;
if (rules) {
  for (const [glob, rule] of Object.entries(rules)) {
    const loaders = (rule as { loaders?: Array<{ loader?: string }> }).loaders;
    const isYakRule =
      Array.isArray(loaders) &&
      loaders.some((l) => typeof l?.loader === "string" && l.loader.includes("turbo-loader"));
    if (isYakRule && glob.includes("{js,")) {
      rules[glob.replace("{js,", "{")] = rule;
      delete rules[glob];
    }
  }
}

export default config;
