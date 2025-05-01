import { createMDX } from "fumadocs-mdx/next";
import { withYak } from "next-yak/withYak";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  serverExternalPackages: ["typescript", "twoslash"],
  experimental: {
    optimizePackageImports: ["shiki", "@shikijs/monaco", "yak-swc"],
  },
  outputFileTracingIncludes: {
    // add yak-swc as a dependency for the /api/transform route
    "/api/transform": ["./node_modules/yak-swc/*"],
    "/api/transform": ["./node_modules/yak-swc/target/wasm32-wasip1/release/*"],
  },
  outputFileTracingExcludes: {
    "/api/transform": ["../../node_modules/yak-swc/**/*"],
  },
  // use the raw-loader for .d.ts files (used by the playground)
  webpack: (config) => {
    config.module.rules.push({
      test: /\.d\.c?ts$/,
      resourceQuery: /raw/,
      use: "raw-loader",
    });

    return config;
  },
};

export default withYak(withMDX(config));
