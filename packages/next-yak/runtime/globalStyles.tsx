import type { ComponentStyles } from "./cssLiteral.js";
import type { YakComponent } from "./publicStyledApi.js";

/**
 * Values that may be interpolated into a `globalStyles` template.
 *
 * Only build-time values are allowed — constants, `keyframes` animation names,
 * static `css` mixins and styled-component selectors. Runtime functions
 * (`${(props) => ...}`) are intentionally excluded: a global rule has no element
 * to attach a CSS variable to. Declare a CSS custom property instead and toggle
 * it via an attribute/class on the root element.
 */
export type GlobalStylesInterpolation =
  | string
  | number
  // keyframes`...` resolves to the animation name (a string) at build time
  | ComponentStyles<{}>
  | YakComponent<any>;

/**
 * Declares global, unscoped styles that ride the same zero-runtime extraction
 * pipeline as `styled` and `keyframes`.
 *
 * Global styles are **part of the stylesheet, not part of the render tree**.
 * They apply exactly when the module declaring them is included in the bundle —
 * typically by importing it from a layout or entry point. They cannot be
 * conditionally mounted; express conditions in CSS (`@media`, `@supports`,
 * `:root[data-theme]`, `:has()`) or through CSS custom properties.
 *
 * @usage
 *
 * ```tsx
 * import { globalStyles, keyframes } from "next-yak";
 *
 * const fadeIn = keyframes`
 *   from { opacity: 0; }
 * `;
 *
 * globalStyles`
 *   :root {
 *     --spacing: 4px;
 *   }
 *
 *   body {
 *     margin: 0;
 *   }
 *
 *   ::view-transition-new(root) {
 *     animation: ${fadeIn} 200ms ease;
 *   }
 * `;
 * ```
 */
export const globalStyles = (
  _styles: TemplateStringsArray,
  ..._values: Array<GlobalStylesInterpolation>
): void => {
  return undefined;
};
