/**
 * Adds the yak `css` prop to Solid's JSX types.
 *
 * Solid compiles JSX natively (via babel-preset-solid), so unlike React
 * there is no jsx-runtime module to wrap — importing "@yak/solid" is enough
 * to activate this augmentation.
 *
 * The css prop is compiled away by the yak SWC plugin into a
 * `__yak_mergeCssProp` spread; on custom components it requires the
 * component to accept `class` and `style` props.
 */
import type { ComponentStyles } from "./cssLiteral.ts";

declare module "@solidjs/web" {
  namespace JSX {
    // ElementAttributes is the shared base of HTMLAttributes, SVGAttributes
    // and MathMLAttributes in Solid 2. Declaration merging requires the type
    // parameter to keep Solid's original name.
    // eslint-disable-next-line no-unused-vars
    interface ElementAttributes<T> {
      css?: ComponentStyles<{}>;
    }
  }
}

export {};
