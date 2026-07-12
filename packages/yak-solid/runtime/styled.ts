import { css, CSSInterpolation, ClassNames, yakComponentSymbol } from "./cssLiteral.js";
import type {
  AnyComponent,
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
  StyleObject,
} from "./publicStyledApi.js";
import { createMemo, mergeSolidProps, renderDynamic } from "./solid-compat.js";
// the following import is not relative but the package-level "@yak/solid/context"
// export: it keeps a single context instance shared between the bundled runtime
// and user code (and lets the vite plugin alias the user's theme context)
import { useTheme } from "@yak/solid/context";
import type { YakTheme } from "./context/index.js";

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
export const styled = styledFactory as Styled;

type PropsWithClassAndStyle = {
  class?: string;
  style?: StyleObject | string;
  theme?: YakTheme;
} & Record<string, unknown>;

const yakStyled: StyledInternal = (Component, attrs) => {
  const isYakComponent = typeof Component === "function" && yakComponentSymbol in Component;

  // if the component that is wrapped is a yak component, we can extract the attrs function
  // and the dynamic style function to merge it with the current attrs function (or dynamic
  // style function) so that the sequence of the attrs functions is preserved
  const [, parentAttrsFn, parentRuntimeStylesFn, parentTarget] = isYakComponent
    ? ((Component as YakComponent<unknown>)[yakComponentSymbol] as unknown as [
        YakComponent<unknown>,
        ExtractAttrsFunction<typeof attrs>,
        RuntimeStyleProcessor<unknown>,
        AnyComponent<any> | string,
      ])
    : [];

  // the ultimate render target of the whole styled(styled(...)) chain:
  // attrs and style processors are already merged at construction time, so
  // a chain of N levels renders the target directly in ONE component instead
  // of re-entering every parent wrapper per element
  const targetComponent = (isYakComponent ? parentTarget : Component) as AnyComponent<any> | string;

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

    // fast path for fully static components (no attrs, no dynamic styles —
    // the most common case): contribute the chain's class names through a
    // single reactive `class` getter and strip $-props; skips theme lookup,
    // memo creation and style handling entirely
    const Yak: AnyComponent<PropsWithClassAndStyle> =
      !mergedAttrsFn && !runtimeStyleProcessor.$dynamic
        ? (props) => {
            // props that already went through a yak wrapper keep their processed class
            if ("$__runtimeStylesProcessed" in props) {
              return renderDynamic(
                mergeSolidProps(filterDomProps(props), { component: targetComponent }),
              );
            }
            return renderDynamic(
              mergeSolidProps(filterDomProps(props), {
                component: targetComponent,
                // reading props.class inside the getter keeps the class
                // binding reactive without re-creating the element
                get class(): string | undefined {
                  const classNames = new ClassNames(normalizeClass(props.class));
                  runtimeStyleProcessor(props, classNames, undefined as unknown as StyleObject);
                  return classNames.value || undefined;
                },
              }),
            );
          }
        : (props) => {
            // the component body runs ONCE in Solid — all per-update work
            // lives in memos/getters so only the affected DOM bindings update

            // attrs functions and dynamic style functions receive the theme —
            // fully static components take the fast path above and never
            // subscribe to the theme context
            const theme = useTheme();

            // getter-preserving merge: compiled prop functions like
            // `({ $bottom }) => ...` destructure this proxy INSIDE the memo
            // below, so every read is tracked at its use-site
            const propsWithTheme = mergeSolidProps({ theme }, props) as PropsWithClassAndStyle & {
              theme: YakTheme;
            };

            // The first component which is not wrapped in a yak component executes all attrs
            // functions starting from the innermost yak component to the outermost (itself)
            const attrsProps =
              mergedAttrsFn && !("$__attrs" in props)
                ? createMemo(() => mergedAttrsFn(propsWithTheme as any) as PropsWithClassAndStyle)
                : undefined;

            // input for the style processor: props + theme + attrs output
            const styleInput = attrsProps
              ? mergeSolidProps(propsWithTheme, attrsProps)
              : propsWithTheme;

            // execute all functions inside the style literal if not already executed
            // e.g. styled.button`color: ${props => props.color};`
            // only reads inside this memo re-run it — the element itself is
            // never re-created, only its class/style bindings update
            const computed =
              "$__runtimeStylesProcessed" in props
                ? undefined
                : createMemo(() => {
                    const attrsResult = attrsProps?.();
                    const classNames = new ClassNames(normalizeClass(props.class));
                    const attrsClass = normalizeClass(attrsResult?.class);
                    if (attrsClass) {
                      classNames.add(attrsClass);
                    }
                    // static processors never write style values, so the incoming
                    // style object can be passed through without a defensive copy
                    const style =
                      runtimeStyleProcessor.$dynamic || attrsResult?.style
                        ? { ...unwrapStyle(props.style), ...unwrapStyle(attrsResult?.style) }
                        : unwrapStyle(props.style);
                    runtimeStyleProcessor(styleInput, classNames, style as StyleObject);
                    return {
                      class: classNames.value || undefined,
                      style: style && Object.keys(style).length > 0 ? style : undefined,
                    };
                  });

            const merged = mergeSolidProps(
              props,
              attrsProps ?? {},
              computed
                ? {
                    get class(): string | undefined {
                      return computed().class;
                    },
                    get style(): StyleObject | undefined {
                      return computed().style;
                    },
                  }
                : {},
            );

            // keep the theme prop only if an attrs function intentionally
            // replaced it — the context theme itself never reaches the target
            const allowTheme = () => {
              const attrsResult = attrsProps?.();
              return !!attrsResult && "theme" in attrsResult && attrsResult.theme !== theme;
            };

            // render the chain's target directly — parent wrappers contribute
            // only their (already merged) attrs and style processors
            return renderDynamic(
              mergeSolidProps(filterDomProps(merged, allowTheme), {
                component: targetComponent,
              }),
            );
          };

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
 * Normalize Solid `class` values for the ClassNames collector.
 * Solid 2 allows strings, arrays and object syntax on the class attribute.
 */
const normalizeClass = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(normalizeClass).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return Object.keys(value)
      .filter((key) => (value as Record<string, unknown>)[key])
      .join(" ");
  }
  return String(value);
};

/**
 * Normalize a Solid style prop to an object the style processor can extend.
 * Solid allows string styles on elements — converted here so CSS custom
 * properties from dynamic values can be merged in (prefer object styles).
 */
const unwrapStyle = (style: StyleObject | string | undefined): StyleObject | undefined => {
  if (typeof style !== "string") {
    return style;
  }
  const result: Record<string, string> = {};
  for (const declaration of style.split(";")) {
    const colonIndex = declaration.indexOf(":");
    if (colonIndex === -1) continue;
    const property = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();
    if (property && value) {
      result[property] = value;
    }
  }
  return result as StyleObject;
};

const isBlockedProp = (key: PropertyKey, allowTheme?: () => boolean): boolean =>
  typeof key === "string" &&
  (key.startsWith("$") || (key === "theme" && !(allowTheme && allowTheme())));

/**
 * Remove all props that start with a $ sign (plus the internal theme) so
 * they reach neither DOM elements nor custom components.
 *
 * Implemented as a lazy Proxy instead of an eager copy: Solid's compiled
 * spread reads props through getters, and copying would read every prop
 * exactly once and freeze its value — killing reactivity.
 */
const filterDomProps = <T extends object>(props: T, allowTheme?: () => boolean): T =>
  new Proxy(props, {
    get: (target, key) => (isBlockedProp(key, allowTheme) ? undefined : Reflect.get(target, key)),
    has: (target, key) => !isBlockedProp(key, allowTheme) && Reflect.has(target, key),
    ownKeys: (target) => Reflect.ownKeys(target).filter((key) => !isBlockedProp(key, allowTheme)),
    getOwnPropertyDescriptor: (target, key) =>
      isBlockedProp(key, allowTheme) ? undefined : Reflect.getOwnPropertyDescriptor(target, key),
  });

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
 * `{ class: "a", foo: 1 }` and `{ class: "b", bar: 2 }` \
 * => `{ class: "a b", foo: 1, bar: 2 }`
 */
const combineProps = <
  T extends {
    class?: string;
    style?: StyleObject | string;
  },
  TOther extends
    | {
        class?: string;
        style?: StyleObject | string;
      }
    | null
    | undefined,
>(
  props: T,
  newProps: TOther,
) =>
  newProps
    ? (props.class === newProps.class || !newProps.class) &&
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
          class: mergeClassNames(props.class, newProps.class),
          style: { ...unwrapStyle(props.style), ...unwrapStyle(newProps.style) },
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
      return combineProps(
        parentProps as any,
        ownAttrsFn(combineProps(props as any, parentProps as any) as any),
      ) as any;
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
const buildRuntimeStylesProcessor = <T>(
  runtimeStylesFn: RuntimeStyleProcessor<T>,
  parentRuntimeStylesFn?: RuntimeStyleProcessor<T>,
) => {
  if (runtimeStylesFn && parentRuntimeStylesFn) {
    const combined: RuntimeStyleProcessor<T> = Object.assign(
      (props: T, classNames: Parameters<RuntimeStyleProcessor<T>>[1], style: StyleObject) => {
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
  Component: AnyComponent<T> | YakComponent<T> | HtmlTags | string,
  attrs?: Attrs<T, TAttrsIn, TAttrsOut>,
) => StyledLiteral<Substitute<T, TAttrsIn>>;

/**
 * Utility type to extract the AttrsFunction from the Attrs type
 */
export type ExtractAttrsFunction<T> = T extends (p: any) => any ? T : never;
