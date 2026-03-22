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
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.d\.c?ts$/,
      resourceQuery: /raw/,
      use: "raw-loader",
    });

    // The playground runs next-yak's webpack loader in the browser.
    // Alias node:path to pathe (a browser-compatible path library)
    // so url() rewriting works on the client side.
    if (!isServer) {
      config.resolve.alias["node:path"] = "pathe";
    }

    return config;
  },
};

export default withYak(
  {
    experiments: {
      transpilationMode: "Css",
    },
  },
  withMDX(config),
);
