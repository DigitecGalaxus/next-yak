/**
 * Allows to use CSS keyframe animations in a styled or css block
 *
 * @usage
 *
 * ```tsx
 * import { styled, keyframes } from "next-yak";
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
export const keyframes = <T extends (string | number | bigint)[] = never>(
  styles: TemplateStringsArray,
  ...dynamic: T
): string => {
  // during compilation all args of keyframe are compiled
  // to a string which references the animation name
  return styles as any as string;
};
