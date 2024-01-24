/**
 * A stub that allows us to use the `css()` (css literal function) inside of *.yak files.
 *
 * This is mainly used for tooling like stylelint and typechecking inside css of *.yak files.
 * It works similar to String.raw but filters out undefined, null and false values to allow for conditionals.
 *
 * @example
 * ```tsx
 * // inside of example.yak.ts
 * import { css } from "next-yak";
 * import { data } from "./another.yak.ts";
 *
 * const styles = css`
 *   .foo {
 *     color: red;
 *     ${data.isBar && css`
 *       background: blue;
 *     `}
 *   }
 * `
 * ```
 */
export const staticCss = (
  strings: TemplateStringsArray,
  ...values: Array<string | number | boolean | null | undefined>
): string =>
  String.raw(
    strings,
    ...values.map((value) =>
      // filter out everything but strings and numbers
      {
        const type = typeof value;
        return type === "number" || type === "string" ? value : "";
      }
    )
  ).trim();
