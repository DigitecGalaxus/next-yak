import { ComponentStyles, css } from "./cssLiteral.js";
import { RuntimeStyleProcessor as RuntimeStyleProcessor } from "./publicStyledApi.js";

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
  const staticClasses: string[] = [];
  const dynamicFunctions: RuntimeStyleProcessor<T>[] = [];

  for (const atom of atoms) {
    if (typeof atom === "string") {
      staticClasses.push(...atom.split(" "));
    } else if (typeof atom === "function") {
      dynamicFunctions.push(atom);
    }
  }

  const runtimeFunctions: RuntimeStyleProcessor<T>[] =
    staticClasses.length > 0
      ? [
          (_, classNames) => {
            staticClasses.forEach((cls) => classNames.add(cls));
          },
          ...dynamicFunctions,
        ]
      : dynamicFunctions;

  // @ts-expect-error the internal implementation of css is not typed
  return css(...runtimeFunctions);
};
