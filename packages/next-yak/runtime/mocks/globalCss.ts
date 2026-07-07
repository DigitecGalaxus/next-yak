import type { globalCss as globalCssInternal } from "../globalCss.js";

export type { GlobalCssInterpolation } from "../globalCss.js";

/**
 * Test-friendly mock of `globalCss`.
 *
 * `globalCss` has no runtime behaviour — the SWC plugin extracts its CSS at
 * build time and replaces the call with a no-op. The mock mirrors that: it does
 * nothing so yak files can be imported in Jest/Vitest without the compiler.
 */
export const globalCss: typeof globalCssInternal = (_styles, ..._values) => {
  // no-op in the mock
};
