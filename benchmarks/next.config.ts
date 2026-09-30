import path from "node:path";
import type { NextConfig } from "next";
import { withYak } from "@yak/react/withYak";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(import.meta.dirname, ".."),
};

export default withYak(nextConfig);
