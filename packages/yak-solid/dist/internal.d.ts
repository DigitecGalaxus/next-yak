import { JSX } from "@solidjs/web";
import { YakThemeProvider, useTheme } from "@yak/solid/context";

//#region runtime/cssProp.d.ts
declare module "@solidjs/web" {
  namespace JSX {
    interface ElementAttributes<T> {
      css?: ComponentStyles<{}>;
    }
  }
}
//#endregion
//#region runtime/context/index.d.ts
interface YakTheme {}
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
declare const keyframes: <T extends (string | number | bigint)[] = never>(styles: TemplateStringsArray, ..._dynamic: T) => string;
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
declare const styled: Styled;
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
declare const globalStyle: (_styles: TemplateStringsArray, ..._values: Array<GlobalStyleInterpolation>) => void;
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
declare function css<TProps>(styles: TemplateStringsArray, ...values: CSSInterpolation<NoInfer<TProps> & {
  theme: YakTheme;
}>[]): ComponentStyles<TProps>;
//#endregion
//#region runtime/internals/unitPostFix.d.ts
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
declare const unitPostFix: (arg: unknown, unit: string) => string | ((props: any) => string | /*elided*/any | undefined) | undefined;
//#endregion
//#region runtime/internals/mergeCssProp.d.ts
/**
 * This is an internal helper function to merge relevant props of a native element with a css prop.
 * It's automatically added when using the `css` prop in a JSX element.
 * e.g.:
 * ```tsx
 * <p
 *  class="foo"
 *  css={css`
 *   color: green;
 * `}
 * {...{ style: { padding: "30px" }}}
 * />
 */
declare const mergeCssProp: (relevantProps: {
  class?: string;
  style?: Record<string, string>;
} & Record<string, unknown>, cssProp: RuntimeStyleProcessor<unknown>) => {
  class?: string;
  style?: Record<string, string>;
};
//#endregion
//#region runtime/styledDom.d.ts
declare const __yak_a: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_abbr: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_address: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_area: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_article: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_aside: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_audio: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_b: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_base: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_bdi: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_bdo: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_big: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_blockquote: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_body: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_br: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_button: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_canvas: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_caption: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_cite: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_code: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_col: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_colgroup: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_data: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_datalist: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_dd: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_del: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_details: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_dfn: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_dialog: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_div: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_dl: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_dt: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_em: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_embed: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_fieldset: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_figcaption: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_figure: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_footer: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_form: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_h1: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_h2: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_h3: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_h4: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_h5: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_h6: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_header: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_hgroup: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_hr: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_html: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_i: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_iframe: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_img: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_input: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_ins: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_kbd: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_keygen: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_label: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_legend: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_li: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_link: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_main: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_map: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_mark: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_menu: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_menuitem: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_meta: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_meter: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_nav: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_noscript: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_object: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_ol: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_optgroup: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_option: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_output: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_p: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_param: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_picture: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_pre: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_progress: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_q: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_rp: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_rt: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_ruby: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_s: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_samp: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_script: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_section: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_select: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_small: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_source: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_span: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_strong: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_style: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_sub: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_summary: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_sup: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_table: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_tbody: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_td: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_textarea: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_tfoot: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_th: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_thead: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_time: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_tr: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_track: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_u: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_ul: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_use: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_var: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_video: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_wbr: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_circle: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_clipPath: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_defs: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_ellipse: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_foreignObject: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_g: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_image: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_line: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_linearGradient: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_marker: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_mask: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_path: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_pattern: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_polygon: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_polyline: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_radialGradient: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_rect: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_stop: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_svg: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_text: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
declare const __yak_tspan: LiteralWithAttrs<import("@solidjs/web").JSX.ElementAttributes<Element>>;
//#endregion
export { YakThemeProvider, __yak_a, __yak_abbr, __yak_address, __yak_area, __yak_article, __yak_aside, __yak_audio, __yak_b, __yak_base, __yak_bdi, __yak_bdo, __yak_big, __yak_blockquote, __yak_body, __yak_br, __yak_button, __yak_canvas, __yak_caption, __yak_circle, __yak_cite, __yak_clipPath, __yak_code, __yak_col, __yak_colgroup, __yak_data, __yak_datalist, __yak_dd, __yak_defs, __yak_del, __yak_details, __yak_dfn, __yak_dialog, __yak_div, __yak_dl, __yak_dt, __yak_ellipse, __yak_em, __yak_embed, __yak_fieldset, __yak_figcaption, __yak_figure, __yak_footer, __yak_foreignObject, __yak_form, __yak_g, __yak_h1, __yak_h2, __yak_h3, __yak_h4, __yak_h5, __yak_h6, __yak_header, __yak_hgroup, __yak_hr, __yak_html, __yak_i, __yak_iframe, __yak_image, __yak_img, __yak_input, __yak_ins, __yak_kbd, __yak_keygen, __yak_label, __yak_legend, __yak_li, __yak_line, __yak_linearGradient, __yak_link, __yak_main, __yak_map, __yak_mark, __yak_marker, __yak_mask, __yak_menu, __yak_menuitem, mergeCssProp as __yak_mergeCssProp, __yak_meta, __yak_meter, __yak_nav, __yak_noscript, __yak_object, __yak_ol, __yak_optgroup, __yak_option, __yak_output, __yak_p, __yak_param, __yak_path, __yak_pattern, __yak_picture, __yak_polygon, __yak_polyline, __yak_pre, __yak_progress, __yak_q, __yak_radialGradient, __yak_rect, __yak_rp, __yak_rt, __yak_ruby, __yak_s, __yak_samp, __yak_script, __yak_section, __yak_select, __yak_small, __yak_source, __yak_span, __yak_stop, __yak_strong, __yak_style, __yak_sub, __yak_summary, __yak_sup, __yak_svg, __yak_table, __yak_tbody, __yak_td, __yak_text, __yak_textarea, __yak_tfoot, __yak_th, __yak_thead, __yak_time, __yak_tr, __yak_track, __yak_tspan, __yak_u, __yak_ul, unitPostFix as __yak_unitPostFix, __yak_use, __yak_var, __yak_video, __yak_wbr, atoms, css, globalStyle, keyframes, styled, useTheme };
//# sourceMappingURL=internal.d.ts.map