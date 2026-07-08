import type { globalStyles as globalStylesInternal } from "../globalStyles.js";

export type { GlobalStylesInterpolation } from "../globalStyles.js";

/**
 * Test-friendly mock of `globalStyles`.
 *
 * `globalStyles` has no runtime behaviour — the SWC plugin extracts its CSS at
 * build time and replaces the call with a no-op. The mock mirrors that: it does
 * nothing so yak files can be imported in Jest/Vitest without the compiler.
 */
export const globalStyles: typeof globalStylesInternal = (_styles, ..._values) => {
  // no-op in the mock
};
