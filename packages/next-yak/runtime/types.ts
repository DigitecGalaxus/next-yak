import React from "react";
import type { YakTheme } from "./context/index.d.ts";
import { CSSInterpolation, yakComponentSymbol } from "./cssLiteral.js";

/**
 * Main styled interface that combines HTML tag mappings with the styled function.
 * This is the primary entry point for creating styled components.
 */
export interface Styled extends MappedHtmlTags, StyledFn {}

/**
 * Function interface for creating styled components from any component or HTML tag.
 * Supports React components, HTML tags, and custom web components.
 */
export interface StyledFn {
  <
    TProps extends object = React.DOMAttributes<Element> &
      React.RefAttributes<Element>,
  >(
    Component:
      | HtmlTags
      | React.FunctionComponent<TProps>
      | CustomWebComponentTag,
  ): LiteralWithAttrs<TProps>;
}

/**
 * Internal function where attrs are passed to be processed
 */
export type StyledInternal = <
  T extends object,
  TAttrsIn extends object = {},
  TAttrsOut extends AttrsMerged<T, TAttrsIn> = AttrsMerged<T, TAttrsIn>,
>(
  Component: React.FunctionComponent<T> | YakComponent<T> | HtmlTags | string,
  attrs?: Attrs<T, TAttrsIn, TAttrsOut>,
) => StyledLiteral<Substitute<T, TAttrsIn>>;

/**
 * A yak component with a special symbol that allows component targeting
 * and proper attrs function handling.
 * @example styled.svg`${Button}:hover & { fill: red; }` or styled(Button)`color: red;`
 */
export interface YakComponent<T> extends React.FunctionComponent<T> {
  [yakComponentSymbol]: [unknown, unknown];
}

/**
 * Styled component with attrs method for adding default props.
 * Extends StyledLiteral with the ability to specify default attributes.
 */
export interface LiteralWithAttrs<T extends object> extends StyledLiteral<T> {
  attrs: <
    TAttrsIn extends object = {},
    TAttrsOut extends AttrsMerged<T, TAttrsIn> = AttrsMerged<T, TAttrsIn>,
  >(
    attrs: Attrs<T, TAttrsIn, TAttrsOut>,
  ) => StyledLiteral<Substitute<T, TAttrsIn>>;
}

/**
 * Template literal function for defining CSS styles with interpolation support.
 * Accepts CSS template strings and interpolated values with proper typing.
 */
export interface StyledLiteral<T> {
  <TCSSProps>(
    styles: TemplateStringsArray,
    ...values: Array<
      CSSInterpolation<
        T &
          // Prevent TypeScript from inferring types from template literal usage
          // This ensures proper typing and enables destructuring hints
          NoInfer<TCSSProps> & { theme: YakTheme }
      >
    >
  ): YakComponent<TCSSProps & T>;
}

/**
 * Maps all HTML tag names to their corresponding styled component types with attributes support.
 * Provides typed access to all standard HTML elements through the styled interface.
 */
export type MappedHtmlTags = {
  [Tag in HtmlTags]: LiteralWithAttrs<React.JSX.IntrinsicElements[Tag]>;
};

/**
 * The attrs function allows adding additional props to a styled component.
 * Props can be specified as an object or as a function that receives current props.
 */
export type Attrs<
  TBaseProps,
  TIn extends object = {},
  TOut extends AttrsMerged<TBaseProps, TIn> = AttrsMerged<TBaseProps, TIn>,
> = Partial<TOut> | AttrsFunction<TBaseProps, TIn, TOut>;

/**
 * Function variant of attrs that receives current props and returns additional props.
 * Allows for dynamic prop generation based on component state.
 */
export type AttrsFunction<
  TBaseProps,
  TIn extends object = {},
  TOut extends AttrsMerged<TBaseProps, TIn> = AttrsMerged<TBaseProps, TIn>,
> = (p: Substitute<TBaseProps & { theme: YakTheme }, TIn>) => Partial<TOut>;

/**
 * Utility type to extract the AttrsFunction from the Attrs type
 */
export type ExtractAttrsFunction<T> = T extends (p: any) => any ? T : never;

/**
 * Merges provided props with initial props, making specified props optional.
 * Includes theme support for styled components.
 */
export type AttrsMerged<TBaseProps, TIn extends object = {}> = Substitute<
  TBaseProps & { theme?: YakTheme },
  TIn
>;

/**
 * Utility type to merge two object types, with properties from B taking precedence.
 * If a property exists in both A and B, the property from B is used.
 */
export type Substitute<A extends object, B extends object> = FastOmit<
  A,
  keyof B
> &
  B;

/**
 * Union type of all valid HTML element tag names.
 * Derived from React's JSX intrinsic elements.
 */
type HtmlTags = keyof React.JSX.IntrinsicElements;

/**
 * Custom web component tag pattern that must contain at least one hyphen.
 * Follows the web component naming convention.
 */
type CustomWebComponentTag = `${string}-${string}`;

/**
 * Utility type to efficiently remove properties from an object type.
 * More performant than the built-in Omit type for large object types.
 */
type FastOmit<T extends object, U extends string | number | symbol> = {
  [K in keyof T as K extends U ? never : K]: T[K];
};
