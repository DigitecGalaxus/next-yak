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
export const atoms = (...atoms: (string | Fn | false)[]) => {
  const classes = atoms.filter((atom) => typeof atom === "string");
  const dynamicFunctions: Fn[] = [
    (_: unknown, classNames: Set<string>, style: Record<string, string>) => {
      for (const singleClass of classes) {
        classNames.add(singleClass);
      }
    },
    ...atoms.filter((atom) => typeof atom === "function"),
  ];

  // @ts-expect-error wip
  return css(...dynamicFunctions);
};

type Fn = (
  props: unknown,
  classNames: Set<string>,
  style: Record<string, string>,
) => void;
