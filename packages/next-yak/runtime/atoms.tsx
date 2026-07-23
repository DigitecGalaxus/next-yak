import { ClassNames, ComponentStyles, css } from "./cssLiteral.js";
import { RuntimeStyleProcessor } from "./publicStyledApi.js";

/**
 * Allows to use atomic CSS classes in a styled or css block
 *
 * @usage
 *
 * ```tsx
 * import { styled, atoms } from "next-yak";
 *
 * const Button = styled.button<{ $primary?: boolean }>`
 *  ${atoms("text-teal-600", "text-base", "rounded-md")}
 *  ${props => props.$primary && atoms("shadow-md")}
 * `;
 * ```
 */
export const atoms = <T,>(
  ...atoms: (string | RuntimeStyleProcessor<T> | false)[]
): ComponentStyles<T> => {
  const staticClasses = new ClassNames();
  const dynamicFunctions: RuntimeStyleProcessor<T>[] = [];

  for (const atom of atoms) {
    if (typeof atom === "string") {
      staticClasses.add(atom);
    } else if (typeof atom === "function") {
      dynamicFunctions.push(atom);
    }
  }

  // the collected classes are passed as css()'s static class name,
  // only the dynamic atoms stay functions
  // @ts-expect-error the internal implementation of css is not typed
  return css(staticClasses.value, ...dynamicFunctions);
};
