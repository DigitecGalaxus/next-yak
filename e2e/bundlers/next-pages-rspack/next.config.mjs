import { withYak } from "next-yak/withYak";
import withRspack from "next-rspack";

/** @type {import('next').NextConfig} */
const nextConfig = {};

// withRspack requires TURBOPACK=auto (set by next dev/build).
// During `next start` no bundler env is set, so skip withRspack.
const rspackConfig =
  process.env.TURBOPACK === "auto" ? withRspack(nextConfig) : nextConfig;
export default withYak(rspackConfig);
