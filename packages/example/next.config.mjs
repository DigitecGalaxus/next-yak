import { withYak } from "next-yak/withYak";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
