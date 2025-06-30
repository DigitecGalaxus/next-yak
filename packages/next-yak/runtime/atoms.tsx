import { ComponentStyles, css } from "./cssLiteral.js";
import { RuntimeStylesFunction } from "./publicStyledApi.js";

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
  ...atoms: (string | RuntimeStylesFunction<T> | false)[]
): ComponentStyles<T> => {
  const classes = atoms
    .filter((atom) => typeof atom === "string")
    .flatMap((atom) => atom.split(" "));
  const dynamicFunctions: RuntimeStylesFunction<T>[] = [
    (_, classNames) => {
      for (const singleClass of classes) {
        classNames.add(singleClass);
      }
    },
    ...atoms.filter((atom) => typeof atom === "function"),
  ];

  // @ts-expect-error the internal implementation of css is not typed
  return css(...dynamicFunctions);
};
