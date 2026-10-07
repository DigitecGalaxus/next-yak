/**
 * Adds the yak `css` prop to Qwik's JSX types.
 *
 * Qwik compiles JSX through its own optimizer, so unlike React there is no
 * jsx-runtime module to wrap. Importing "@yak/qwik" is enough to activate
 * this augmentation.
 *
 * The css prop is compiled away by the yak SWC plugin into a
 * `__yak_mergeCssProp` spread; on custom components it requires the
 * component to accept `class` and `style` props.
 */
import type { ComponentStyles } from "./cssLiteral.ts";

declare module "@qwik.dev/core/internal" {
  // DOMAttributes is the shared base of every element's attributes in Qwik 2.
  // Declaration merging requires the type parameter to keep Qwik's original name.
  // eslint-disable-next-line no-unused-vars
  interface DOMAttributes<EL extends Element> {
    css?: ComponentStyles<{}>;
  }
}
