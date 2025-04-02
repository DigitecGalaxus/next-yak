import { createMDX } from "fumadocs-mdx/next";
import { withYak } from "next-yak/withYak";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["shiki", "@shikijs/monaco", "yak-swc"],
    // serverComponentsExternalPackages: ["next-yak"],
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

  // webpack: (config, { isServer }) => {
  //   config.ignoreWarnings = [
  //     { module: /node_modules\/node-fetch\/lib\/index\.js/ },
  //     {
  //       message:
  //         /require function is used in a way in which dependencies cannot be statically extracted/,
  //     },
  //     {
  //       message:
  //         /require\.extensions is not supported by webpack\. Use a loader instead\./,
  //     },
  //   ];
  //   return config;
  // },
};

export default withYak(withMDX(config));
