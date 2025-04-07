import ReactJSXRuntime from "react/jsx-runtime";
import type { ComponentStyles } from "./mocks/cssLiteral.js";

// Only return the css prop if the "className" and "style" properties are present
// This was inspired from emotion
// https://github.com/emotion-js/emotion/blob/cce67ec6b2fc94261028b4f4778aae8c3d6c5fd6/packages/react/src/jsx-namespace.ts#L9C6-L9C28
type WithConditionalCSSProp<P> = "className" | "style" extends keyof P
  ? string extends P["className" & keyof P]
    ? Record<string, any> extends P["style" & keyof P]
      ? { css?: ComponentStyles<Record<keyof any, never>> }
      : {}
    : {}
  : {};

const Fragment = ReactJSXRuntime.Fragment;
const jsx = ReactJSXRuntime.jsx;
const jsxs = ReactJSXRuntime.jsxs;

export declare namespace YakJSX {
  export type Element = React.JSX.Element;
  export type ElementType = React.JSX.ElementType;
  export type ElementClass = React.JSX.ElementClass;
  export type ElementAttributesProperty = React.JSX.ElementAttributesProperty;
  export type ElementChildrenAttribute = React.JSX.ElementChildrenAttribute;

  // Add the CSS prop to all components that can receive "className" and "style"
  export type LibraryManagedAttributes<C, P> = P extends unknown
    ? WithConditionalCSSProp<P> & React.JSX.LibraryManagedAttributes<C, P>
    : never;

  export type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
  export type IntrinsicClassAttributes<T> =
    React.JSX.IntrinsicClassAttributes<T>;

  export type IntrinsicElements = {
    [K in keyof React.JSX.IntrinsicElements]: React.JSX.IntrinsicElements[K] & {
      // Add the CSS prop to all native elements e.g. "div" or "span"
      css?: ComponentStyles<Record<keyof any, never>>;
    };
  };
}

export { Fragment, jsx, jsxs, type YakJSX as JSX };
