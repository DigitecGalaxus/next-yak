import type { NextConfig } from "next";
import { withYak } from "next-yak/withYak";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  // Fully static site: no server at runtime. The search index is prerendered to
  // a static asset (see app/api/search/route.ts) and queried in the browser.
  output: "export",
  images: { unoptimized: true },
};

export default withYak(withMDX(nextConfig));
