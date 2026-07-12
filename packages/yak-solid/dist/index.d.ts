import { JSX, JSX as JSX$1 } from "@solidjs/web";
//#region runtime/context/index.d.ts
interface YakTheme {}
/**
 * Returns the current yak theme
 *
 * The returned object is a live view: property reads are forwarded to the
 * nearest provider's current `theme` prop, so reads inside memos/effects
 * stay reactive when the theme changes.
 */
declare const useTheme: () => YakTheme;
/**
 * Yak theme context provider
 *
 * Solid context values are not reactive by themselves - the provider hands
 * out a stable proxy that forwards every read to the current `props.theme`,
 * so swapping the theme re-runs exactly the computations that used it.
 */
declare const YakThemeProvider: (props: {
  children?: JSX$1.Element;
  theme?: YakTheme;
}) => JSX$1.Element;
//#endregion
//#region runtime/publicStyledApi.d.ts
/**
 * Component signature accepted and produced by `styled`.
 *
 * Intentionally NOT Solid 2's `Component` type: that alias constrains props
 * to `Record<string, any>` which does not compose with the `object`-based
 * generics of the styled API (kept in sync with the React runtime).
 */
type AnyComponent<T> = (props: T) => JSX.Element;
/**
 * Style object the runtime writes CSS custom properties into.
 * Solid also allows string styles on elements - the runtime normalizes
 * those to objects before processing (see `unwrapStyle` in styled.ts).
 */
type StyleObject = JSX.CSSProperties & Record<`--${string}`, string | number | undefined>;
/**
 * Main styled interface that combines HTML tag mappings with the styled function.
 * This is the primary entry point for creating styled components.
 */
interface Styled extends MappedHtmlTags, StyledFn {}
/**
 * Function interface for creating styled components from any component or HTML tag.
 * Supports Solid components, HTML tags, and custom web components.
 */
interface StyledFn {
  <TProps extends object = JSX.ElementAttributes<Element>>(Component: HtmlTags | AnyComponent<TProps> | CustomWebComponentTag): LiteralWithAttrs<TProps>;
}
/**
 * A yak component with a special symbol that allows component targeting
 * and proper attrs function handling.
 * @example styled.svg`${Button}:hover & { fill: red; }` or styled(Button)`color: red;`
 */
interface YakComponent<T> extends AnyComponent<T> {
  [yakComponentSymbol]: [unknown, unknown, unknown, unknown];
}
/**
 * Styled component with attrs method for adding default props.
 * Extends StyledLiteral with the ability to specify default attributes.
 */
interface LiteralWithAttrs<T extends object> extends StyledLiteral<T> {
  attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<T, TAttrsIn> = AttrsMerged<T, TAttrsIn>>(attrs: Attrs<T, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<T, TAttrsIn>>;
}
/**
 * Template literal function for defining CSS styles with interpolation support.
 * Accepts CSS template strings and interpolated values with proper typing.
 */
interface StyledLiteral<T> {
  <TCSSProps>(styles: TemplateStringsArray, ...values: Array<CSSInterpolation<T & NoInfer<TCSSProps> & {
    theme: YakTheme;
  }>>): YakComponent<TCSSProps & T>;
}
/**
 * Function variant of attrs that receives current props and returns additional props.
 * Allows for dynamic prop generation based on component state.
 */
interface AttrsFunction<TBaseProps, TIn extends object = {}, TOut extends AttrsMerged<TBaseProps, TIn> = AttrsMerged<TBaseProps, TIn>> {
  (p: Substitute<TBaseProps & {
    theme: YakTheme;
  }, TIn>): Partial<TOut>;
}
/**
 * Merges provided props with initial props, making specified props optional.
 * Includes theme support for styled components.
 */
type AttrsMerged<TBaseProps, TIn extends object = {}> = Substitute<TBaseProps & {
  theme?: YakTheme;
}, TIn>;
/**
 * Maps all HTML tag names to their corresponding styled component types with attributes support.
 * Provides typed access to all standard HTML elements through the styled interface.
 */
type MappedHtmlTags = { [Tag in HtmlTags]: LiteralWithAttrs<JSX.IntrinsicElements[Tag]> };
/**
 * The attrs function allows adding additional props to a styled component.
 * Props can be specified as an object or as a function that receives current props.
 */
type Attrs<TBaseProps, TIn extends object = {}, TOut extends AttrsMerged<TBaseProps, TIn> = AttrsMerged<TBaseProps, TIn>> = Partial<TOut> | AttrsFunction<TBaseProps, TIn, TOut>;
/**
 * Utility type to merge two object types, with properties from B taking precedence.
 * If a property exists in both A and B, the property from B is used.
 */
type Substitute<A extends object, B extends object> = FastOmit<A, keyof B> & B;
/**
 * Union type of all valid HTML element tag names.
 * Derived from Solid's JSX intrinsic elements.
 */
type HtmlTags = keyof JSX.IntrinsicElements;
/**
 * Custom web component tag pattern that must contain at least one hyphen.
 * Follows the web component naming convention.
 */
type CustomWebComponentTag = `${string}-${string}`;
/**
 * Utility type to efficiently remove properties from an object type.
 * More performant than the built-in Omit type for large object types.
 */
type FastOmit<T extends object, U extends string | number | symbol> = { [K in keyof T as K extends U ? never : K]: T[K] };
/**
 * Set-like collector for class names.
 *
 * Implemented as a string builder in the runtime (a Set<string>
 * split → Set → Array.from → join round-trip dominates render cost);
 * a real Set<string> also satisfies this interface.
 */
type ClassNameCollector = {
  add(className: string): void;
  has(className: string): boolean;
  delete(className: string): void;
};
/**
 * Type of all functions that can be passed to manipulate styles
 *
 * `$dynamic` marks processors that execute user functions or write style
 * values at render time; purely static processors (class names only) can
 * skip theme lookup and style-object allocation.
 */
type RuntimeStyleProcessor<T> = ((props: T, classNames: ClassNameCollector, style: StyleObject) => void) & {
  $dynamic?: boolean;
};
/**
 * Utility type to keep the generic API of a component while still being able to use it in a selector
 */
type GenericYakComponentOf<T, P = {}> = T & YakComponent<P> & {
  <G = {}>(props: P & G): JSX.Element;
};
//#endregion
//#region runtime/cssLiteral.d.ts
declare const yakComponentSymbol: unique symbol;
type ComponentStyles<TProps> = (props: TProps) => {
  className: string;
  style?: {
    [key: string]: string;
  };
};
type CSSInterpolation<TProps> = string | number | undefined | null | false | ComponentStyles<TProps> | {
  [yakComponentSymbol]: any;
} | ((props: TProps) => CSSInterpolation<TProps>);
/**
 * css() runtime factory of css``
 *
 * /!\ @yak/solid transpiles css`` and styled``
 *
 * This changes the typings of the css`` and styled`` functions.
 * During development the user of @yak/solid wants to work with the
 * typings BEFORE compilation.
 *
 * Therefore this is only an internal function only and it must be cast to any
 * before exported to the user.
 *
 * The internal functioning of css`` is to return a single callback function that runs all functions
 * (or creates new ones if needed) that are passed as arguments. These functions receive the props, classNames, and style object as arguments
 * and operate directly on the classNames and style objects.
 */
declare function css$1<TProps>(styles: TemplateStringsArray, ...values: CSSInterpolation<NoInfer<TProps> & {
  theme: YakTheme;
}>[]): ComponentStyles<TProps>;
//#endregion
//#region runtime/cssProp.d.ts
declare module "@solidjs/web" {
  namespace JSX {
    interface ElementAttributes<T> {
      css?: ComponentStyles<{}>;
    }
  }
}
//#endregion
//#region runtime/atoms.d.ts
/**
 * Allows to use atomic CSS classes in a styled or css block
 *
 * @usage
 *
 * ```tsx
 * import { styled, atoms } from "@yak/solid";
 *
 * const Button = styled.button<{ $primary?: boolean }>`
 *  ${atoms("text-teal-600", "text-base", "rounded-md")}
 *  ${props => props.$primary && atoms("shadow-md")}
 * `;
 * ```
 */
declare const atoms: <T>(...atoms: (string | RuntimeStyleProcessor<T> | false)[]) => ComponentStyles<T>;
//#endregion
//#region runtime/mocks/cssLiteral.d.ts
/**
 * Allows to use CSS styles in a styled or css block
 *
 * e.g.
 *
 * ```tsx
 * const Component = styled.div`
 *  color: black;
 *  ${({$active}) => $active && css`color: red;`}
 * `;
 * ```
 */
declare const css: typeof css$1;
//#endregion
//#region runtime/keyframes.d.ts
/**
 * Allows to use CSS keyframe animations in a styled or css block
 *
 * @usage
 *
 * ```tsx
 * import { styled, keyframes } from "@yak/solid";
 *
 * const rotate = keyframes`
 *  from {
 *   transform: rotate(0deg);
 *  }
 *  to {
 *   transform: rotate(360deg);
 *  }
 * `;
 *
 * const Spinner = styled.div`
 *   animation: ${rotate} 1s linear infinite;
 * `;
 * ```
 */
declare const keyframes$1: <T extends (string | number | bigint)[] = never>(styles: TemplateStringsArray, ..._dynamic: T) => string;
//#endregion
//#region runtime/mocks/keyframes.d.ts
/**
 * Allows to use CSS keyframe animations in a styled or css block
 *
 * @usage
 *
 * ```tsx
 * import { styled, keyframes } from "@yak/solid";
 *
 * const rotate = keyframes`
 *  from {
 *   transform: rotate(0deg);
 *  }
 *  to {
 *   transform: rotate(360deg);
 *  }
 * `;
 *
 * const Spinner = styled.div`
 *   animation: ${rotate} 1s linear infinite;
 * `;
 * ```
 */
declare const keyframes: typeof keyframes$1;
//#endregion
//#region runtime/styled.d.ts
/**
 * The `styled` method works perfectly on all of your own or any third-party component,
 * as long as they attach the passed `class` prop to a DOM element.
 *
 * @usage
 *
 * ```tsx
 * const StyledLink = styled(Link)`
 *  color: #BF4F74;
 *  font-weight: bold;
 * `;
 * ```
 */
declare const styled$1: Styled;
//#endregion
//#region runtime/mocks/styled.d.ts
declare const styled: typeof styled$1;
//#endregion
//#region runtime/globalStyle.d.ts
/**
 * Values that may be interpolated into a `globalStyle` template.
 *
 * Only build-time values are allowed — constants, `keyframes` animation names,
 * static `css` mixins and styled-component selectors. Runtime functions
 * (`${(props) => ...}`) are intentionally excluded: a global rule has no element
 * to attach a CSS variable to. Declare a CSS custom property instead and toggle
 * it via an attribute/class on the root element.
 */
type GlobalStyleInterpolation = string | number | ComponentStyles<{}> | YakComponent<any>;
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
 * import { globalStyle, keyframes } from "@yak/solid";
 *
 * const fadeIn = keyframes`
 *   from { opacity: 0; }
 * `;
 *
 * globalStyle`
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
declare const globalStyle$1: (_styles: TemplateStringsArray, ..._values: Array<GlobalStyleInterpolation>) => void;
//#endregion
//#region runtime/mocks/globalStyle.d.ts
/**
 * Test-friendly mock of `globalStyle`.
 *
 * `globalStyle` has no runtime behaviour — the SWC plugin extracts its CSS at
 * build time and replaces the call with a no-op. The mock mirrors that: it does
 * nothing so yak files can be imported in Jest/Vitest without the compiler.
 */
declare const globalStyle: typeof globalStyle$1;
//#endregion
export { type GenericYakComponentOf, type GlobalStyleInterpolation, type YakComponent, type YakTheme, YakThemeProvider, atoms, css, globalStyle, keyframes, styled, useTheme };