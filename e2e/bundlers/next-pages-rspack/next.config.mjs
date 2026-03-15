import { withYak } from "next-yak/withYak";
import withRspack from "next-rspack";

/** @type {import('next').NextConfig} */
const nextConfig = {};

// withRspack must wrap nextConfig first — it cleans up the TURBOPACK env var
// before withYak checks it to select the correct bundler integration.
export default withYak(withRspack(nextConfig));
