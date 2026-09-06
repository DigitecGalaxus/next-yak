import { css, CSSInterpolation, Classes, yakComponentSymbol } from "./cssLiteral.js";
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
import { createMemo, untrack, type MemoOptions } from "solid-js";
import {
  ChildProperties,
  createComponent,
  dynamic,
  escape,
  getNextElement,
  isServer,
  MathMLElements,
  resolveSSRNode,
  runHydrationEvents,
  spread,
  ssr,
  ssrClassName,
  ssrHydrationKey,
  ssrStyle,
  SVGElements,
  template,
  type JSX,
} from "@solidjs/web";
import { normalizeClass } from "./internals/mergeClasses.js";
// the following import is not relative but the package-level "@yak/solid/context"
// export: it keeps a single context instance shared between the bundled runtime
// and user code (and lets the vite plugin alias the user's theme context)
import { useTheme } from "@yak/solid/context";
import type { YakTheme } from "./context/index.js";
import type { Accessor } from "solid-js";

//
// The `styled()` API without `styled.` syntax
//
// The API design is inspired by styled-components:
// https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/constructors/styled.tsx
// https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/models/StyledComponent.ts
//
// Element names HTML and SVG share. Solid picks the namespace from the parent
// at insertion time, so it cannot be decided when the styled component is made.
const ambiguousSvgTags = new Set([
  "a", // the HTML link and the SVG link element
  "script", // a document script and SVG's embedded script element
  "style", // a document stylesheet and SVG's embedded stylesheet element
  "title", // the document title and SVG's accessible name for a shape
]);

/** the compiler's template for one element; a namespaced one is cloned out of its root */
const elementTemplate = (tag: string) => {
  if (SVGElements.has(tag) && tag !== "svg") return template(`<svg><${tag}>`, 2);
  if (MathMLElements.has(tag) && tag !== "math") return template(`<math><${tag}>`, 2);
  return template(`<${tag}>`);
};

/**
 * Renders a tag target the way the compiler renders `<tag {...props} />`: on
 * the server one `ssrElement` call, on the client the claimed or cloned
 * element plus one `spread`. No memo and no owner per element, so a styled
 * element gets the same hydration key an unstyled one would. (Solid's
 * `dynamic()` adds a memo so the tag can change; a styled tag never does.)
 */
const elementRenderer = (tag: string): ((props: Record<PropertyKey, unknown>) => JSX.Element) => {
  // these four exist in HTML and in SVG and only the parent decides, which
  // `dynamic()` resolves at insertion time. Its memo takes a hydration id,
  // so the server goes through it as well
  if (ambiguousSvgTags.has(tag)) {
    return dynamic(() => tag);
  }
  if (isServer) {
    // `yakProps` returns the serializer for the element instead of a props
    // object (see there); a props record and a function do not overlap, so
    // the cast has to go through `unknown`
    return (render) => (render as unknown as () => JSX.Element)();
  }
  const create = elementTemplate(tag);
  return (props) => {
    const el = getNextElement(create);
    // no children, no insert effect; a key check, nothing to track
    spread(
      el,
      props,
      untrack(() => !("children" in props)),
    );
    runHydrationEvents();
    return el;
  };
};

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
  theme?: Accessor<YakTheme>;
} & Record<string, unknown>;

const yakStyled: StyledInternal = (Component, attrs) => {
  // Probe with a property read, not the `in` operator: in dev, solid-refresh
  // wraps registered components in a Proxy that forwards `get` to the live
  // implementation but has no `has` trap, so `in` would miss the symbol and
  // silently skip chain flattening (breaking attrs override order).
  const isYakComponent =
    typeof Component === "function" &&
    (Component as Partial<YakComponent<unknown>>)[yakComponentSymbol] !== undefined;

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

    // Chosen once per styled component, not once per element. A component
    // target is called directly, which also leaves a prop named `component`
    // free for the author to use.
    const isTag = typeof targetComponent === "string";
    const tag = isTag ? targetComponent : undefined;
    const renderTarget = isTag
      ? elementRenderer(targetComponent)
      : (finalProps: Record<PropertyKey, unknown>) =>
          createComponent(
            targetComponent as (props: Record<PropertyKey, unknown>) => JSX.Element,
            finalProps,
          );

    // fast path for fully static components (no attrs, no dynamic styles;
    // the most common case): contribute the chain's class names through a
    // single reactive `class` getter and strip $-props; skips theme lookup,
    // memo creation and style handling entirely
    const isStatic = !mergedAttrsFn && !runtimeStyleProcessor.$dynamic;
    // a static chain contributes the same classes to every element, so they
    // are collected once here instead of once per element
    const staticClass = isStatic ? collectStaticClass(runtimeStyleProcessor) : undefined;
    // one function per styled component, not one closure per element; the
    // client reads it through a getter, so the class binding stays reactive
    const staticClassOf = (props: PropsWithClassAndStyle): string | undefined => {
      const userClass = normalizeClass(props.class);
      if (!userClass) return staticClass;
      const classes = new Classes(userClass);
      runtimeStyleProcessor(props, classes, undefined as unknown as StyleObject);
      return classes.value || undefined;
    };
    const Yak: AnyComponent<PropsWithClassAndStyle> = isStatic
      ? (props) => renderTarget(yakProps(props, staticClassOf, undefined, tag))
      : (props) => {
          // attrs functions and style interpolations receive the theme; the
          // static path above never subscribes to it
          const theme = useTheme();
          const propsWithTheme = withTheme(props, theme);
          const compute = () =>
            computeStyles(props, propsWithTheme, mergedAttrsFn, runtimeStyleProcessor);
          // On the server nothing re-reads, so the computation runs once. On
          // the client a memo keeps the class and style bindings live; a
          // transparent one takes no hydration id, so the element gets the
          // same key on both sides.
          const computed = isServer
            ? once(compute)
            : createMemo(compute, { transparent: true } as MemoOptions<ComputedStyles>);
          return renderTarget(
            yakProps(
              props,
              () => computed().class,
              () => computed().style,
              tag,
              mergedAttrsFn ? () => computed().attrs : undefined,
              // the theme prop stays only if an attrs function replaced it
              () => {
                const attrs = computed().attrs;
                return !!attrs && "theme" in attrs && attrs.theme !== theme;
              },
            ),
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

const hasKeys = (object: object): boolean => {
  for (const _ in object) return true;
  return false;
};

/**
 * Normalize a Solid style prop to an object the style processor can extend.
 * Solid allows string styles on elements; they are converted here so CSS custom
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

/**
 * The props as attrs functions and style interpolations see them: the author's
 * props plus the context theme. An author-supplied `theme` prop wins, as in
 * React. A Proxy that answers one key instead of a merge: nothing is copied,
 * and a read of `$active` goes straight to the compiled getter on the original
 * props object, so it stays lazy and tracked where it is read. (A prototype
 * chain would copy nothing either, but a new prototype per element gives the
 * read site a new object shape every time and the engine stops optimizing it.)
 */
const withTheme = (
  props: PropsWithClassAndStyle,
  theme: Accessor<YakTheme>,
): PropsWithClassAndStyle & { theme: Accessor<YakTheme> } =>
  ("theme" in props
    ? props
    : new Proxy(props, {
        get: (target, key) => (key === "theme" ? theme : Reflect.get(target, key)),
        has: (target, key) => key === "theme" || Reflect.has(target, key),
        ownKeys: (target) => [...Reflect.ownKeys(target), "theme"],
        getOwnPropertyDescriptor: (target, key) =>
          key === "theme"
            ? { value: theme, enumerable: true, configurable: true }
            : Reflect.getOwnPropertyDescriptor(target, key),
      })) as PropsWithClassAndStyle & {
    theme: Accessor<YakTheme>;
  };

/**
 * Style interpolations also see the output of the attrs functions, which wins
 * over the author's props. A lookup, not a copy.
 */
const withAttrs = <T extends object>(props: T, attrs: Record<string, unknown>): T =>
  new Proxy(props, {
    get: (target, key) =>
      typeof key === "string" && key in attrs ? attrs[key] : Reflect.get(target, key),
    has: (target, key) => (typeof key === "string" && key in attrs) || Reflect.has(target, key),
  });

type ComputedStyles = {
  class: string | undefined;
  style: StyleObject | undefined;
  attrs: PropsWithClassAndStyle | undefined;
};

/** attrs first (innermost yak component to outermost), then the style interpolations */
const computeStyles = (
  props: PropsWithClassAndStyle,
  propsWithTheme: PropsWithClassAndStyle,
  attrsFn: ((props: any) => unknown) | undefined,
  processor: RuntimeStyleProcessor<unknown>,
): ComputedStyles => {
  const attrs = attrsFn ? (attrsFn(propsWithTheme) as PropsWithClassAndStyle) : undefined;
  const classes = new Classes(normalizeClass(props.class));
  const attrsClass = normalizeClass(attrs?.class);
  if (attrsClass) classes.add(attrsClass);
  // a static processor writes no style values, so the author's style object
  // can pass through without a copy
  const style =
    processor.$dynamic || attrs?.style
      ? { ...unwrapStyle(props.style), ...unwrapStyle(attrs?.style) }
      : unwrapStyle(props.style);
  processor(
    attrs ? withAttrs(propsWithTheme, attrs) : propsWithTheme,
    classes,
    style as StyleObject,
  );
  return {
    class: classes.value || undefined,
    style: style && hasKeys(style) ? style : undefined,
    attrs,
  };
};

/** runs `fn` on the first call and returns that result from then on */
const once = <T>(fn: () => T): (() => T) => {
  let done = false;
  let value: T;
  return () => {
    if (!done) {
      value = fn();
      done = true;
    }
    return value;
  };
};

/**
 * The classes a static style processor adds. It reads no props, so running it
 * once with an empty collector gives the value every element will get.
 */
const collectStaticClass = (processor: RuntimeStyleProcessor<unknown>): string | undefined => {
  const classes = new Classes();
  processor(undefined, classes, undefined as unknown as StyleObject);
  return classes.value || undefined;
};

/** what a styled element's final props are assembled from */
type PropSources<T extends object> = {
  props: T;
  /** keys the target must not see, in the author's props or the attrs output */
  skip: (key: PropertyKey) => boolean;
  classOf: (props: T) => string | undefined;
  styleFn: (() => StyleObject | undefined) | undefined;
  attrsProps: (() => Record<string, unknown> | undefined) | undefined;
};

const skipKey = (
  key: PropertyKey,
  hasStyle: boolean,
  isTag: boolean,
  allowTheme: (() => boolean) | undefined,
): boolean =>
  typeof key === "string" &&
  (key.charCodeAt(0) === 36 /* $ */ ||
    key === "class" ||
    (key === "style" && hasStyle) ||
    (key === "theme" && !(allowTheme && allowTheme())) ||
    (isTag && key === "component"));

/**
 * The props a styled element hands to its target: the author's props, the
 * attrs output on top, then this wrapper's `class` and `style`. $-props and
 * the internal theme never come out. `component` names the tag for Solid, so
 * a tag target never sees it either.
 */
const yakProps = <T extends object>(
  props: T,
  classOf: (props: T) => string | undefined,
  styleFn: (() => StyleObject | undefined) | undefined,
  tag: string | undefined,
  attrsProps?: () => Record<string, unknown> | undefined,
  allowTheme?: () => boolean,
): T => {
  const hasStyle = styleFn !== undefined;
  const isTag = tag !== undefined;
  const sources: PropSources<T> = {
    props,
    skip: (key) => skipKey(key, hasStyle, isTag, allowTheme),
    classOf,
    styleFn,
    attrsProps,
  };
  if (isServer && isTag) return serverRender(tag, sources) as unknown as T;
  if (!attrsProps) return copyProps(sources) as T;
  return proxyProps(sources) as T;
};

/**
 * On the server the props are read once, after the hydration key is taken,
 * so this returns a function for the element renderer to call. Most tags
 * serialize the element directly; the tags `dynamic()` renders get the props
 * object `ssrElement` reads.
 */
const serverRender = <T extends object>(tag: string, sources: PropSources<T>) =>
  ambiguousSvgTags.has(tag) ? () => serverProps(sources) : () => serializeElement(tag, sources);

/** every key the target sees, in `ssrElement` order: author props with attrs winning in place, then new attrs keys */
const forEachProp = <T extends object>(
  sources: PropSources<T>,
  attrs: Record<string, unknown> | undefined,
  visit: (key: string, value: unknown) => void,
) => {
  const props = sources.props as Record<string, unknown>;
  for (const key of Object.keys(props)) {
    if (!sources.skip(key)) visit(key, attrs && key in attrs ? attrs[key] : props[key]);
  }
  if (!attrs) return;
  for (const key of Object.keys(attrs)) {
    if (!sources.skip(key) && !(key in props)) visit(key, attrs[key]);
  }
};

const VOID_ELEMENTS =
  /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;

/** a styled tag as `ssrElement` would write it, straight from the sources */
const serializeElement = <T extends object>(tag: string, sources: PropSources<T>): JSX.Element => {
  const hk = ssrHydrationKey();
  const attrs = sources.attrsProps?.();
  const className = sources.classOf(sources.props);
  const style = sources.styleFn?.();
  const skipChildren = VOID_ELEMENTS.test(tag);
  let result = `<${tag}${hk}`;
  let children: unknown;
  forEachProp(sources, attrs, (key, value) => {
    if (!ChildProperties.has(key)) result += attribute(key, value);
    else if (children === undefined && !skipChildren) children = childContent(tag, key, value);
  });
  if (className !== undefined) result += ` class="${ssrClassName(className)}"`;
  if (style !== undefined) result += ` style="${ssrStyle(style as Record<string, string>)}"`;
  if (skipChildren) return { t: result + "/>" } as unknown as JSX.Element;
  if (typeof children === "function") children = children();
  return ssr(
    [result + ">", `</${tag}>`],
    resolveSSRNode(children, undefined, true),
  ) as unknown as JSX.Element;
};

/** one attribute as `ssrElement` writes it, with its leading space, or nothing */
const attribute = (prop: string, value: unknown): string => {
  if (prop === "style") return ` style="${ssrStyle(value as string)}"`;
  if (prop === "class") return ` class="${ssrClassName(value as string)}"`;
  if (value == undefined || prop === "ref" || prop.startsWith("on") || prop.startsWith("prop:")) {
    return "";
  }
  if (typeof value === "boolean") return value ? ` ${escape(prop)}` : "";
  return value === "" ? ` ${escape(prop)}` : ` ${escape(prop)}="${escape(value, true)}"`;
};

/** the content a child property carries, escaped unless it is markup */
const childContent = (tag: string, prop: string, value: unknown): unknown =>
  tag === "script" || tag === "style" || prop === "innerHTML" ? value : escape(value);

/** the props object `ssrElement` reads */
const serverProps = <T extends object>(sources: PropSources<T>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  forEachProp(sources, sources.attrsProps?.(), (key, value) => {
    out[key] = value;
  });
  // `ssrElement` writes `class=""` for an undefined class, so leave it out
  const className = sources.classOf(sources.props);
  if (className !== undefined) out.class = className;
  const style = sources.styleFn?.();
  if (style !== undefined) out.style = style;
  return out;
};

/**
 * Without attrs the key set is fixed, so the descriptors are copied onto a
 * plain object. Compiled getters are closures that ignore `this`, so they go
 * over unchanged and are never invoked here; every later read, `in` check and
 * enumeration by the target (a spread, an `omit`) is a plain property access.
 */
const copyProps = <T extends object>(sources: PropSources<T>): Record<PropertyKey, unknown> => {
  const { props, classOf, styleFn } = sources;
  const out: Record<PropertyKey, unknown> = {};
  for (const key of Reflect.ownKeys(props)) {
    if (sources.skip(key)) continue;
    const descriptor = Reflect.getOwnPropertyDescriptor(props, key)!;
    if (descriptor.get || descriptor.set || !descriptor.enumerable) {
      Object.defineProperty(out, key, descriptor);
    } else {
      out[key] = descriptor.value;
    }
  }
  Object.defineProperty(out, "class", {
    get: () => classOf(props),
    enumerable: true,
    configurable: true,
  });
  if (styleFn) {
    Object.defineProperty(out, "style", { get: styleFn, enumerable: true, configurable: true });
  }
  return out;
};

/**
 * With attrs the keys are only known once the attrs ran, so a Proxy resolves
 * each read against the three sources.
 */
const proxyProps = <T extends object>(sources: PropSources<T>): T => {
  const { props, skip, classOf, styleFn } = sources;
  const attrsProps = sources.attrsProps!;
  const classFn = () => classOf(props);
  const contributed = (key: PropertyKey) =>
    key === "class" ? classFn : key === "style" ? styleFn : undefined;
  const fromAttrs = (key: PropertyKey) => {
    const attrs = attrsProps();
    return attrs && key in attrs ? attrs : undefined;
  };
  return new Proxy(props, {
    get(target, key) {
      const getter = contributed(key);
      if (getter) return getter();
      if (skip(key)) return undefined;
      const attrs = fromAttrs(key);
      return attrs ? attrs[key as string] : Reflect.get(target, key);
    },
    has(target, key) {
      if (contributed(key)) return true;
      if (skip(key)) return false;
      return Reflect.has(target, key) || fromAttrs(key) !== undefined;
    },
    ownKeys(target) {
      const keys = new Set<string | symbol>();
      for (const key of Reflect.ownKeys(target)) if (!skip(key)) keys.add(key);
      for (const key of Object.keys(attrsProps() ?? {})) if (!skip(key)) keys.add(key);
      // contributed keys last: author props, attrs, then this wrapper's own
      keys.add("class");
      if (styleFn) keys.add("style");
      return [...keys];
    },
    getOwnPropertyDescriptor(target, key) {
      const getter = contributed(key);
      if (getter) return { enumerable: true, configurable: true, get: getter };
      if (skip(key)) return undefined;
      const attrs = fromAttrs(key);
      if (attrs) {
        return { enumerable: true, configurable: true, get: () => attrs[key as string] };
      }
      return Reflect.getOwnPropertyDescriptor(target, key);
    },
  });
};

// util function to merge class names, as they are concatenated with a space
const mergeClasses = (a?: string, b?: string) => {
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
          class: mergeClasses(props.class, newProps.class),
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
      (props: T, classes: Parameters<RuntimeStyleProcessor<T>>[1], style: StyleObject) => {
        parentRuntimeStylesFn(props, classes, style);
        runtimeStylesFn(props, classes, style);
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
