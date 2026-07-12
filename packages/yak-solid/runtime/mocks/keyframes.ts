import type { keyframes as keyframesInternal } from "../keyframes.js";

/**
 * Allows to use CSS keyframe animations in a styled or css block
 *
 * @usage
 *
 * ```tsx
 * import { styled, keyframes } from "@yak/solid";
 *
 * const rotate = keyframes`
 *  from {
 *   transform: rotate(0deg);
 *  }
 *  to {
 *   transform: rotate(360deg);
 *  }
 * `;
 *
 * const Spinner = styled.div`
 *   animation: ${rotate} 1s linear infinite;
 * `;
 * ```
 */
export const keyframes: typeof keyframesInternal = (_styles, ..._dynamic) => {
  // the keyframes function is a no-op in the mock
  // as it has no dynamic runtime behavior but only css
  return "";
};
