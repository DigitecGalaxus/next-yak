import { css } from "./cssLiteral.js";

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
export const atoms = (...atoms: (string | Fn)[]) => {
  const className = atoms.join(" ");
  return () => ({ className });
};

type Fn = (userSuppliedFn: () => void) => void;
