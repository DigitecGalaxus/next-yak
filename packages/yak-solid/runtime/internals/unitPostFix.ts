/**
 * Internal helper called by transformed code - Do not use directly
 *
 * Takes a function and a css unit and returns the result of the function concatenated with the unit
 *
 * ```tsx
 * import { styled } from "@yak/solid";
 *
 * const Button = styled.button<{ $width?: boolean }>`
 *   width: ${({ $width }) => $width}px;
 * `;
 * ```
 *
 * Which will be transformed to:
 *  ```tsx
 * import { styled } from "@yak/solid/internal";
 *
 * const Button = styled.button<{ $width?: boolean }>(
 *  "button", {
 *   width: unitPostFix({ $width }) => $width, "px")
 * });
 */
export const unitPostFix = (arg: unknown, unit: string) => {
  switch (typeof arg) {
    case "function":
      return (props: any) => unitPostFix(arg(props), unit);
    case "number":
    case "string":
      return `${arg}${unit}`;
    // Ignore falsy values
    default:
      return undefined;
  }
};
