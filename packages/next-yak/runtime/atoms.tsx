import { combineProps, ComponentStyles } from "./cssLiteral.js";

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
export const atoms = (...atoms: string[]): ComponentStyles<unknown> => {
  return (props: any) => {
    return combineProps(props, {
      className: atoms.filter(Boolean).join(" "),
    });
  };
};
