import { CSSInterpolation, css, yakComponentSymbol } from "./cssLiteral.js";
import React, {
  HTMLAttributes,
  HtmlHTMLAttributes,
  SVGAttributes,
} from "react";

// the following export is not relative as "next-yak/context"
// links to one file for react server components and
// to another file for classic react components
import { useTheme } from "next-yak/context";
import type { YakTheme } from "./context/index.d.ts";

/** Symbols */

/**
 * This Symbol is a fake theme which was used instead of the real one from the context
 * to speed up rendering
 */
const noTheme: YakTheme = {};

/**
 * All valid html tags
 */
type HtmlTags = keyof React.JSX.IntrinsicElements;

type CustomWebComponentTag = `${string}-${string}`;

/**
 * Return type of the provided props merged with the initial props
 * where the specified props are optional
 */
type AttrsMerged<TBaseProps, TIn extends object = {}> = Substitute<
  TBaseProps & { theme: YakTheme },
  TIn
>;

/**
 * The attrs function allows to add additional props in a function that receives
 * the current props as argument.
 */
type AttrsFunction<
  TBaseProps,
  TIn extends object,
  TOut extends AttrsMerged<TBaseProps, TIn> = AttrsMerged<TBaseProps, TIn>,
> = (p: Substitute<TBaseProps & { theme: YakTheme }, TIn>) => Partial<TOut>;

/**
 * The attrs function allows to add additional props to a styled component.
 * The props can be specified as an object or as a function that receives the
 * current props as argument.
 */
type Attrs<
  TBaseProps,
  TIn extends object = {},
  TOut extends AttrsMerged<TBaseProps, TIn> = AttrsMerged<TBaseProps, TIn>,
> = Partial<TOut> | AttrsFunction<TBaseProps, TIn, TOut>;

//
// The `styled()` API without `styled.` syntax
//
// The API design is inspired by styled-components:
// https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/constructors/styled.tsx
// https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/models/StyledComponent.ts
//
const StyledFactory = <
  T extends object = React.DOMAttributes<Element> &
    React.RefAttributes<Element>,
>(
  Component: HtmlTags | React.FunctionComponent<T> | CustomWebComponentTag,
) =>
  Object.assign(yakStyled(Component), {
    attrs: <
      TAttrsIn extends object = {},
      TAttrsOut extends AttrsMerged<T, TAttrsIn> = AttrsMerged<T, TAttrsIn>,
    >(
      attrs: Attrs<T, TAttrsIn, TAttrsOut>,
    ) => yakStyled<T, TAttrsIn, TAttrsOut>(Component, attrs),
  });

/**
 * A yak component has a special symbol attached to it that allows to
 * target the component from a child component and to correctly handle the attrs function (if any).
 * e.g. styled.svg`${Button}:hover & { fill: red; }` or styled(Button)`color: red;`
 */
type YakComponent<
  T,
  TAttrsIn extends object = {},
  TAttrsOut extends AttrsMerged<T, TAttrsIn> = AttrsMerged<T, TAttrsIn>,
> = React.FunctionComponent<T> & {
  [yakComponentSymbol]: [
    React.FunctionComponent<T>,
    AttrsFunction<T, TAttrsIn, TAttrsOut>,
  ];
};

const yakStyled = <
  T,
  TAttrsIn extends object = {},
  TAttrsOut extends AttrsMerged<T, TAttrsIn> = AttrsMerged<T, TAttrsIn>,
>(
  Component:
    | React.FunctionComponent<T>
    | YakComponent<T, TAttrsIn, TAttrsOut>
    | HtmlTags
    | string,
  attrs?: Attrs<T, TAttrsIn, TAttrsOut>,
) => {
  const isYakComponent =
    typeof Component !== "string" && yakComponentSymbol in Component;

  // if the component that is wrapped is a yak component, we can extract it to render the underlying component directly
  // and we can also extract the attrs function to merge it with the current attrs function so that the sequence of
  // the attrs functions is preserved
  const [parentYakComponent, parentAttrsFn] = isYakComponent
    ? Component[yakComponentSymbol]
    : [];

  const mergedAttrsFn = buildRuntimeAttrsProcessor(attrs, parentAttrsFn);

  return <TCSSProps extends object = {}>(
    styles: TemplateStringsArray,
    ...values: Array<
      CSSInterpolation<T & NoInfer<TCSSProps> & { theme: YakTheme }>
    >
  ) => {
    const getRuntimeStyles = css<object>(styles, ...(values as any));
    const yak = (props: Substitute<TCSSProps & T, TAttrsIn>) => {
      // if the css component does not require arguments
      // it can be called without arguments and we skip calling useTheme()
      //
      // `attrsFn || getRuntimeStyles.length` is NOT against the rule of hooks as
      // getRuntimeStyles and attrsFn are constants defined outside of the component
      //
      // for example
      //
      // const Button = styled.button`color: red;`
      //       ^ does not need to have access to theme, so we skip calling useTheme()
      //
      // const Button = styled.button`${({ theme }) => css`color: ${theme.color};`}`
      //       ^ must be have access to theme, so we call useTheme()
      const theme =
        mergedAttrsFn || getRuntimeStyles.length ? useTheme() : noTheme;

      // The first components which is not wrapped in a yak component will execute all attrs functions
      // starting from the innermost yak component to the outermost yak component (itself)
      const combinedProps =
        "$__attrs" in props
          ? {
              theme,
              ...props,
            }
          : // overwrite and merge the current props with the processed attrs
            combineProps(
              {
                theme,
                ...(props as {
                  className?: string;
                  style?: React.CSSProperties;
                }),
                // mark the props as processed
                $__attrs: true,
              },
              mergedAttrsFn?.({ theme, ...props } as Substitute<
                T & { theme: YakTheme },
                TAttrsIn
              >),
            );
      // execute all functions inside the style literal
      // e.g. styled.button`color: ${props => props.color};`
      const runtimeStyles = getRuntimeStyles(combinedProps as T & TCSSProps);

      // delete the yak theme from the props
      // this must happen after the runtimeStyles are calculated
      // prevents passing the theme prop to the DOM element of a styled component
      const { theme: themeAfterAttr, ...combinedPropsWithoutTheme } =
        combinedProps;
      const propsBeforeFiltering =
        themeAfterAttr === theme ? combinedPropsWithoutTheme : combinedProps;

      // remove all props that start with a $ sign for string components e.g. "button" or "div"
      // so that they are not passed to the DOM element
      const filteredProps = (
        !isYakComponent
          ? removeNonDomProperties(propsBeforeFiltering)
          : propsBeforeFiltering
      ) as T & {
        className?: string;
        style?: React.CSSProperties;
      };

      filteredProps.className = mergeClassNames(
        filteredProps.className,
        runtimeStyles.className,
      );
      filteredProps.style =
        "style" in filteredProps
          ? {
              ...filteredProps.style,
              ...runtimeStyles.style,
            }
          : runtimeStyles.style;

      return parentYakComponent ? (
        // if the styled(Component) syntax is used and the component is a yak component
        // we can call the yak function directly without running through react createElement
        parentYakComponent(filteredProps)
      ) : (
        // if the final component is a string component e.g. styled("div") or a custom non yak fn e.g. styled(MyComponent)
        <Component {...filteredProps} />
      );
    };

    // Assign the yakComponentSymbol directly without forwardRef
    return Object.assign(yak, {
      [yakComponentSymbol]: [yak, mergedAttrsFn],
    }) as YakComponent<
      Substitute<TCSSProps & T, TAttrsIn>,
      object,
      AttrsMerged<Substitute<TCSSProps & T, TAttrsIn>, object>
    >;
  };
};

/**
 * Type for the proxy object returned by `styled` that allows to
 * access all html tags as properties.
 */
type StyledLiteral<T> = <TCSSProps>(
  styles: TemplateStringsArray,
  ...values: Array<
    CSSInterpolation<
      T &
        // don't allow inference from types in the tagged template literal
        // additional benefit is that destruction is now typed and provides hints
        NoInfer<TCSSProps> & { theme: YakTheme }
    >
  >
) => YakComponent<TCSSProps & T>;

/**
 * The `styled` method works perfectly on all of your own or any third-party component,
 * as long as they attach the passed className prop to a DOM element.
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
export const styled =
  // this type is wrong - but it will work correctly with compiled code
  StyledFactory as typeof StyledFactory & {
    [Tag in HtmlTags]: StyledLiteral<React.JSX.IntrinsicElements[Tag]> & {
      attrs: <
        TAttrsIn extends object = {},
        TAttrsOut extends AttrsMerged<
          React.JSX.IntrinsicElements[Tag],
          TAttrsIn
        > = AttrsMerged<React.JSX.IntrinsicElements[Tag], TAttrsIn>,
      >(
        attrs: Attrs<React.JSX.IntrinsicElements[Tag], TAttrsIn, TAttrsOut>,
      ) => StyledLiteral<
        Substitute<React.JSX.IntrinsicElements[Tag], TAttrsIn>
      >;
    };
  };

/**
 * Remove all entries that start with a $ sign
 *
 * This allows to have props that are used for internal stylingen purposes
 * but are not be passed to the DOM element
 */
const removeNonDomProperties = <T extends Record<string, unknown>>(
  obj: T,
): T => {
  const result = {} as T;
  for (const key in obj) {
    if (!key.startsWith("$") && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
};

// util function to merge class names, as they are concatenated with a space
const mergeClassNames = (a?: string, b?: string) => {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  return a + " " + b;
};

/**
 * merge props and processed props (including class names and styles)
 * e.g.:\
 * `{ className: "a", foo: 1 }` and `{ className: "b", bar: 2 }` \
 * => `{ className: "a b", foo: 1, bar: 2 }`
 */
const combineProps = <
  T extends {
    className?: string;
    style?: React.CSSProperties;
  },
  TOther extends
    | {
        className?: string;
        style?: React.CSSProperties;
      }
    | null
    | undefined,
>(
  props: T,
  newProps: TOther,
) =>
  newProps
    ? (props.className === newProps.className || !newProps.className) &&
      (props.style === newProps.style || !newProps.style)
      ? // shortcut if no style and class merging is necessary
        {
          ...props,
          ...newProps,
        }
      : // merge class names and styles
        {
          ...props,
          ...newProps,
          className: mergeClassNames(props.className, newProps.className),
          style: { ...(props.style || {}), ...(newProps.style || {}) },
        }
    : // if no new props are provided, no merging is necessary
      props;

// util type to remove properties from an object
type FastOmit<T extends object, U extends string | number | symbol> = {
  [K in keyof T as K extends U ? never : K]: T[K];
};

// util type to merge two objects
// if a property is present in both objects the property from B is used
export type Substitute<A extends object, B extends object> = FastOmit<
  A,
  keyof B
> &
  B;

/**
 * Merges the attrs function of the current component with the attrs function of the parent component
 * in order to preserve the sequence of the attrs functions.
 * Note: In theory, the parentAttrsFn can have different types for TAttrsIn and TAttrsOut
 * but as this is only used internally, we can ignore and simplify this case
 * @param attrs The attrs object or function of the current component (if any)
 * @param parentAttrsFn The attrs function of the parent/wrapped component (if any)
 * @returns A function that receives the props and returns the transformed props
 */
const buildRuntimeAttrsProcessor = <
  T,
  TAttrsIn extends object,
  TAttrsOut extends AttrsMerged<T, TAttrsIn>,
>(
  attrs?: Attrs<T, TAttrsIn, TAttrsOut>,
  parentAttrsFn?: AttrsFunction<T, TAttrsIn, TAttrsOut>,
): AttrsFunction<T, TAttrsIn, TAttrsOut> | undefined => {
  const ownAttrsFn =
    attrs && (typeof attrs === "function" ? attrs : () => attrs);

  if (ownAttrsFn && parentAttrsFn) {
    return (props) => {
      const parentProps = parentAttrsFn(props);

      // overwrite and merge the parent props with the props received from the attrs function
      // after they went through the parent attrs function.
      //
      // This makes sure the linearity of the attrs functions is preserved and all attrs function receive
      // the whole props object calculated from the previous attrs functions
      return combineProps(
        parentProps,
        ownAttrsFn(combineProps(props, parentProps)),
      );
    };
  }

  return ownAttrsFn || parentAttrsFn;
};
