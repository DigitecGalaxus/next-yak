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
  // use the raw-loader for .d.ts files (used by the playground)
  webpack: (config) => {
    config.module.rules.push({
      test: /\.d\.c?ts$/,
      resourceQuery: /raw/,
      use: "raw-loader",
    });

    // don't throw an error if fs is not available on client
    config.resolve.fallback = { fs: false };

    // ignore the warnings
    // (we should use @babel/parser and @babel/traverse instead of @babel/core in our loader)
    config.ignoreWarnings = [
      {
        module: /node_modules[\\/]browserslist[\\/]node\.js/,
        message: /Critical dependency/,
      },
      {
        module: /node_modules[\\/]@babel[\\/]core/,
        message: /require\.extensions/,
      },
      {
        module: /node_modules[\\/]@babel[\\/]core/,
        message: /Critical dependency/,
      },
    ];

    return config;
  },
};

export default withYak(withMDX(config));
