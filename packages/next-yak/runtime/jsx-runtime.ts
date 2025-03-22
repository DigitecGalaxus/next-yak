import ReactJSXRuntime from "react/jsx-runtime";
import type { ComponentStyles } from "./mocks/cssLiteral.js";

type WithConditionalCSSProp<P> = "className" extends keyof P
  ? string extends P["className" & keyof P]
    ? { css?: ComponentStyles<Record<keyof any, never>> }
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

  export type LibraryManagedAttributes<C, P> = P extends unknown
    ? WithConditionalCSSProp<P> & React.JSX.LibraryManagedAttributes<C, P>
    : never;

  export type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
  export type IntrinsicClassAttributes<T> =
    React.JSX.IntrinsicClassAttributes<T>;

  export type IntrinsicElements = {
    [K in keyof React.JSX.IntrinsicElements]: React.JSX.IntrinsicElements[K] & {
      css?: ComponentStyles<Record<keyof any, never>>;
    };
  };
}

export { Fragment, jsx, jsxs, type YakJSX as JSX };
