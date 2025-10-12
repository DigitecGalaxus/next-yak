import type { NextConfig } from "next";
import { withYak } from "next-yak/withYak";

const nextConfig: NextConfig = {
  /* config options here */
};

// console.log(process.env);
export default withYak(
  {
    experiments: {
      transpilationMode: "Css",
    },
  },
  nextConfig,
);
