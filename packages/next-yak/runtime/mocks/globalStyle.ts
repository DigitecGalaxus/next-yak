import type { globalStyle as globalStyleInternal } from "../globalStyle.js";

export type { GlobalStyleInterpolation } from "../globalStyle.js";

/**
 * Test-friendly mock of `globalStyle`.
 *
 * `globalStyle` has no runtime behaviour — the SWC plugin extracts its CSS at
 * build time and replaces the call with a no-op. The mock mirrors that: it does
 * nothing so yak files can be imported in Jest/Vitest without the compiler.
 */
export const globalStyle: typeof globalStyleInternal = (_styles, ..._values) => {
  // no-op in the mock
};
