import {
  CSSInterpolation,
  combineProps,
  css,
  yakComponentSymbol,
} from "./cssLiteral.js";
import React from "react";
import type {
  Attrs,
  AttrsMerged,
  Styled,
  YakComponent,
  AttrsFunction,
  StyledFn,
  HtmlTags,
  Substitute,
  StyledLiteral,
} from "./publicStyledApi.js";

// the following export is not relative as "next-yak/context"
// links to one file for react server components and
// to another file for classic react components
import { useTheme } from "next-yak/context";
import type { YakTheme } from "./context/index.d.ts";

/**
 * This Symbol is a fake theme which was used instead of the real one from the context
 * to speed up rendering
 */
const noTheme: YakTheme = {};

//
// The `styled()` API without `styled.` syntax
//
// The API design is inspired by styled-components:
// https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/constructors/styled.tsx
// https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/models/StyledComponent.ts
//
const styledFactory: StyledFn = (Component) =>
  Object.assign(yakStyled(Component), {
    attrs: (attrs: Attrs<any>) => yakStyled(Component, attrs),
  });

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
export const styled = styledFactory as Styled;

const yakStyled: StyledInternal = (Component, attrs) => {
  const isYakComponent =
    typeof Component !== "string" && yakComponentSymbol in Component;

  // if the component that is wrapped is a yak component, we can extract it to render the underlying component directly
  // and we can also extract the attrs function to merge it with the current attrs function so that the sequence of
  // the attrs functions is preserved
  const [parentYakComponent, parentAttrsFn] = isYakComponent
    ? (Component[yakComponentSymbol] as [
        YakComponent<unknown>,
        ExtractAttrsFunction<typeof attrs>,
      ])
    : [];

  const mergedAttrsFn = buildRuntimeAttrsProcessor(attrs, parentAttrsFn);

  return (styles, ...values) => {
    const getRuntimeStyles = css(
      styles,
      ...(values as CSSInterpolation<unknown>[]),
    );
    const yak: React.FunctionComponent = (props) => {
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
      const propsWithTheme =
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
              mergedAttrsFn?.({ theme, ...(props as any) }),
            );
      // execute all functions inside the style literal
      // e.g. styled.button`color: ${props => props.color};`
      const combinedProps = getRuntimeStyles(propsWithTheme) as ReturnType<
        typeof getRuntimeStyles
      > & { theme: YakTheme };

      // delete the yak theme from the props
      // this must happen after the runtimeStyles are calculated
      // prevents passing the theme prop to the DOM element of a styled component
      const { theme: themeAfterAttr, ...combinedPropsWithoutTheme } =
        combinedProps;
      const propsBeforeFiltering =
        themeAfterAttr === theme ? combinedPropsWithoutTheme : combinedProps;

      // remove all props that start with a $ sign for string components e.g. "button" or "div"
      // so that they are not passed to the DOM element
      const filteredProps = !isYakComponent
        ? removeNonDomProperties(propsBeforeFiltering)
        : propsBeforeFiltering;

      return parentYakComponent ? (
        // if the styled(Component) syntax is used and the component is a yak component
        // we can call the yak function directly without running through react createElement
        parentYakComponent(filteredProps)
      ) : (
        // if the final component is a string component e.g. styled("div") or a custom non yak fn e.g. styled(MyComponent)
        <Component
          {...(filteredProps as React.ComponentProps<
            Exclude<typeof Component, string>
          >)}
        />
      );
    };

    // Assign the yakComponentSymbol directly without forwardRef
    return Object.assign(yak, {
      [yakComponentSymbol]: [yak, mergedAttrsFn] as [unknown, unknown],
    });
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
 * Utility type to extract the AttrsFunction from the Attrs type
 */
export type ExtractAttrsFunction<T> = T extends (p: any) => any ? T : never;
