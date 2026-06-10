import { css, CSSInterpolation, ClassNames, yakComponentSymbol } from "./cssLiteral.js";
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
  RuntimeStyleProcessor,
} from "./publicStyledApi.js";

// the following export is not relative as "next-yak/context"
// links to one file for react server components and
// to another file for classic react components
import { useTheme } from "next-yak/context";
import type { YakTheme } from "./context/index.tsx";

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
  const isYakComponent = typeof Component !== "string" && yakComponentSymbol in Component;

  // if the component that is wrapped is a yak component, we can extract it to render the underlying component directly
  // and we can also extract the attrs function and the dynamic style function to merge it with the current attrs function (or dynamic style function)
  // so that the sequence of the attrs functions is preserved
  const [, parentAttrsFn, parentRuntimeStylesFn, parentTarget] = isYakComponent
    ? (Component[yakComponentSymbol] as [
        YakComponent<unknown>,
        ExtractAttrsFunction<typeof attrs>,
        RuntimeStyleProcessor<unknown>,
        React.FunctionComponent | string,
      ])
    : [];

  // the ultimate render target of the whole styled(styled(...)) chain:
  // attrs and style processors are already merged at construction time, so
  // a chain of N levels renders the target directly in ONE wrapper instead
  // of re-entering every parent wrapper per element per render
  // (the re-entry was the structural ×N multiplier in EXP-20260609-02)
  const targetComponent = (isYakComponent ? parentTarget : Component) as
    | React.FunctionComponent
    | string;

  const mergedAttrsFn = buildRuntimeAttrsProcessor(attrs, parentAttrsFn);

  return (styles, ...values) => {
    // combine all interpolated logic into a single function
    // e.g. styled.button`color: ${props => props.color}; margin: ${props => props.margin};`
    const runtimeStylesFn = css(
      styles,
      ...(values as CSSInterpolation<unknown>[]),
    ) as RuntimeStyleProcessor<unknown>;
    const runtimeStyleProcessor = buildRuntimeStylesProcessor(
      runtimeStylesFn,
      parentRuntimeStylesFn,
    );
    const Yak: React.FunctionComponent = (props) => {
      // fast path for fully static components (no attrs, no dynamic styles —
      // the most common case): contribute the chain's class names and strip
      // $-props; skips theme lookup, prop spreading and style cloning
      // entirely (this is NOT against the rule of hooks — the condition is
      // constant for the lifetime of the component)
      if (!mergedAttrsFn && !runtimeStyleProcessor.$dynamic) {
        const filteredProps = removeNonDomProperties(props) as {
          className?: string;
        };
        // props that already went through a yak wrapper (passed through a
        // custom component boundary) keep their processed className
        if (!("$__runtimeStylesProcessed" in props)) {
          const classNames = new ClassNames((props as { className?: string }).className);
          runtimeStyleProcessor(props, classNames, undefined as unknown as React.CSSProperties);
          filteredProps.className = classNames.value || undefined;
        }
        const Target = targetComponent as React.ElementType;
        return <Target {...(filteredProps as React.ComponentProps<typeof Target>)} />;
      }

      // attrs functions and dynamic style functions receive the theme —
      // fully static components take the fast path above and never read the
      // theme context
      //
      // (this previously gated on `runtimeStylesFn.length` — the function
      // ARITY, which is always ≥2 — so useTheme() ran for every component
      // including fully static ones; see EXP-20260609-02)
      const theme = useTheme();

      // The first components which is not wrapped in a yak component will execute all attrs functions
      // starting from the innermost yak component to the outermost yak component (itself)
      const combinedProps =
        "$__attrs" in props
          ? ({
              theme,
              ...props,
            } as {
              theme: YakTheme;
              className?: string;
              style?: React.CSSProperties;
            })
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

      // execute all functions inside the style literal if not already executed
      // e.g. styled.button`color: ${props => props.color};`
      //
      // inner levels of a styled(Component) chain receive already-processed
      // props and skip this entirely — no collector, no style clone
      if (!("$__runtimeStylesProcessed" in combinedProps)) {
        const classNames = new ClassNames(combinedProps.className);
        // static processors never write style values, so the incoming style
        // object can be passed through without a defensive copy
        const styles = runtimeStyleProcessor.$dynamic
          ? { ...combinedProps.style }
          : combinedProps.style;
        runtimeStyleProcessor(combinedProps, classNames, styles as React.CSSProperties);
        // @ts-expect-error this is not typed correctly
        combinedProps.$__runtimeStylesProcessed = true;

        combinedProps.className = classNames.value || undefined;
        if (styles !== combinedProps.style) {
          combinedProps.style = styles;
        }
      }

      // delete the yak theme from the props
      // this must happen after the runtimeStyles are calculated
      // prevents passing the theme prop to the DOM element of a styled component
      const { theme: themeAfterAttr, ...combinedPropsWithoutTheme } = combinedProps;
      const propsBeforeFiltering =
        themeAfterAttr === theme ? combinedPropsWithoutTheme : combinedProps;

      // remove all props that start with a $ sign so they reach neither DOM
      // elements nor custom components — this also strips the internal
      // $__attrs/$__runtimeStylesProcessed markers, which must not cross a
      // custom component boundary (a custom component may render another yak
      // component that has to process its own attrs/styles)
      const filteredProps = removeNonDomProperties(propsBeforeFiltering);

      // render the chain's target directly — parent wrappers contribute only
      // their (already merged) attrs and style processors
      const Target = targetComponent as React.ElementType;
      return <Target {...(filteredProps as React.ComponentProps<typeof Target>)} />;
    };

    // Assign the yakComponentSymbol directly without forwardRef
    return Object.assign(Yak, {
      [yakComponentSymbol]: [Yak, mergedAttrsFn, runtimeStyleProcessor, targetComponent] as [
        unknown,
        unknown,
        unknown,
        unknown,
      ],
    });
  };
};

/**
 * Remove all entries that start with a $ sign
 *
 * This allows to have props that are used for internal styling purposes
 * but are not be passed to the DOM element
 */
const removeNonDomProperties = <T extends Record<string, unknown>>(obj: T): T => {
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
          style: { ...props.style, ...newProps.style },
        }
    : // if no new props are provided, no merging is necessary
      props;

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
  const ownAttrsFn = attrs && (typeof attrs === "function" ? attrs : () => attrs);

  if (ownAttrsFn && parentAttrsFn) {
    return (props) => {
      const parentProps = parentAttrsFn(props);

      // overwrite and merge the parent props with the props received from the attrs function
      // after they went through the parent attrs function.
      //
      // This makes sure the linearity of the attrs functions is preserved and all attrs function receive
      // the whole props object calculated from the previous attrs functions
      return combineProps(parentProps, ownAttrsFn(combineProps(props, parentProps)));
    };
  }

  return ownAttrsFn || parentAttrsFn;
};

/**
 * Merges the runtime style function of the current component with the runtime style function of the parent component
 * in order to preserve the sequence of the attrs functions.
 * @param runtimeStylesFn The current runtime styles function
 * @param parentRuntimeStylesFn The parent runtime styles function
 * @returns The merged runtime styles function
 */
const buildRuntimeStylesProcessor = <T,>(
  runtimeStylesFn: RuntimeStyleProcessor<T>,
  parentRuntimeStylesFn?: RuntimeStyleProcessor<T>,
) => {
  if (runtimeStylesFn && parentRuntimeStylesFn) {
    const combined: RuntimeStyleProcessor<T> = Object.assign(
      (
        props: T,
        classNames: Parameters<RuntimeStyleProcessor<T>>[1],
        style: React.CSSProperties,
      ) => {
        parentRuntimeStylesFn(props, classNames, style);
        runtimeStylesFn(props, classNames, style);
      },
      // the chain is dynamic if any level is dynamic
      { $dynamic: runtimeStylesFn.$dynamic || parentRuntimeStylesFn.$dynamic },
    );
    return combined;
  }
  return runtimeStylesFn || parentRuntimeStylesFn;
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
