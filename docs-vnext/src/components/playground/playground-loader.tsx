"use client";

import dynamic from "next/dynamic";
import { PlaygroundSkeleton } from "./skeleton";

/**
 * Loads the playground in the browser only. Monaco, the worker and the WASM compiler need
 * `window`, and the static export has nothing to prerender for them anyway. Until it
 * loads, the skeleton holds the panels in place.
 */
export const PlaygroundLoader = dynamic(() => import("./playground"), {
  ssr: false,
  loading: () => <PlaygroundSkeleton />,
});
