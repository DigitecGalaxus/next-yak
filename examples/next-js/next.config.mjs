import { withYak } from "@yak/react/withYak";

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  // @yak/react is ESM only. Jest (next/jest) loads it only if Next.js transpiles it
  transpilePackages: ["@yak/react"],
  /**
   * Debug types:
   * - `'ts'` - Show transformed TypeScript
   * - `'css'` - Show extracted CSS
   * - `'css resolved'` - Show CSS after resolving imports
   */
  // experiments: {
  //   debug: { filter: (path) => path.includes('component.tsx'), type: 'css' }
  // },
};

export default withYak(nextConfig);
