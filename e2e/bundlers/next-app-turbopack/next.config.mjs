import { withYak } from "next-yak/withYak";

/** @type {import('next').NextConfig} */
const nextConfig = {};

// Two-mode e2e: opt out of static folding only when YAK_E2E_FOLD_STATIC is
// "false". Otherwise pass no foldStatic key so the config stays inert.
const yakOptions = process.env.YAK_E2E_FOLD_STATIC === "false" ? { foldStatic: false } : {};

export default withYak(yakOptions, nextConfig);
