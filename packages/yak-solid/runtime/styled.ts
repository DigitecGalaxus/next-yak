import { css, Classes, yakComponentSymbol } from "./cssLiteral.js";
import type {
  AnyComponent,
  Attrs,
  AttrsMerged,
  Styled,
  YakComponent,
  StyledFn,
  HtmlTags,
  Substitute,
  StyledLiteral,
  CompiledStyleProcessor,
  StaticStyleProcessor,
  StyleObject,
} from "./publicStyledApi.js";
import { $PROXY, createMemo, untrack } from "solid-js";
import {
  ChildProperties,
  createComponent,
  dynamic,
  escape,
  getNextElement,
  insert,
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
// Keep the runtime and app on the same theme context; Vite can alias this export.
import { useTheme } from "@yak/solid/context";
import type { YakTheme } from "./context/index.js";
import type { Accessor } from "solid-js";

/** the props a styled component receives from its author */
type Props = {
  class?: string;
  style?: StyleObject | string;
  theme?: Accessor<YakTheme>;
} & Record<PropertyKey, unknown>;

type StyleProcessor = CompiledStyleProcessor<unknown>;

type RuntimeAttrsFn = (props: Props) => Props;

type RuntimeAttrs = Props | RuntimeAttrsFn;

type ComputedStyles = {
  class: string | undefined;
  style: StyleObject | undefined;
  attrs: Props | undefined;
};

/**
 * the information to build class and style for one render
 * kept outside of the component props so solid never copies or filters
 * it when it walks the props object
 */
type RenderMeta = {
  skip: (key: PropertyKey) => boolean;
} & (
  | { compute: undefined; classOf: (props: Props) => string | undefined; hasAttrs: false }
  | { compute: () => ComputedStyles; classOf: undefined; hasAttrs: boolean }
);

type ComponentMetadata = [
  component: AnyComponent<any>,
  attrs: RuntimeAttrsFn | undefined,
  styles: StyleProcessor,
  target: AnyComponent<any> | string,
];

type TargetRenderer = (props: Props, meta: RenderMeta) => JSX.Element;

/** Create a styled tag or component, with optional attrs. */
export type StyledInternal = <
  T extends object,
  TAttrsIn extends object = {},
  TAttrsOut extends AttrsMerged<T, TAttrsIn> = AttrsMerged<T, TAttrsIn>,
>(
  Component: AnyComponent<T> | YakComponent<T> | HtmlTags | string,
  attrs?: Attrs<T, TAttrsIn, TAttrsOut>,
) => StyledLiteral<Substitute<T, TAttrsIn>>;

/** These tags can be HTML or SVG. dynamic() chooses from the insertion parent. */
const ambiguousSvgTags = new Set(["a", "script", "style", "title"]);

const VOID_ELEMENTS =
  /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;

const styledFactory: StyledFn = (Component) =>
  Object.assign(yakStyled(Component), {
    attrs: (attrs: Attrs<any>) => yakStyled(Component, attrs),
  });

/** Style a tag or a component that forwards its class prop. */
export const styled = styledFactory as Styled;

const yakStyled: StyledInternal = (Component, attrs) => {
  // solid-refresh forwards reads to the live component, but does not forward `in` checks.
  const isYakComponent =
    typeof Component === "function" &&
    (Component as Partial<YakComponent<unknown>>)[yakComponentSymbol] !== undefined;

  // Apply parent attrs and styles before this component's own.
  const [, parentAttrsFn, parentRuntimeStylesFn, parentTarget] = isYakComponent
    ? ((Component as YakComponent<unknown>)[yakComponentSymbol] as ComponentMetadata)
    : [];

  // Render the chain's final target once, with all attrs and style processors combined.
  const targetComponent = parentTarget ?? Component;

  const mergedAttrsFn = composeAttrs(attrs as RuntimeAttrs | undefined, parentAttrsFn);

  return (styles, ...values) => {
    const runtimeStylesFn = css(styles, ...values);
    const runtimeStyleProcessor = composeStyles(runtimeStylesFn, parentRuntimeStylesFn);

    const isTag = typeof targetComponent === "string";
    const renderTarget = createTargetRenderer(targetComponent);
    const isStatic = !mergedAttrsFn && !runtimeStyleProcessor.$dynamic;
    const omitted = new Set(["class", "theme"]);
    if (isTag) omitted.add("component");
    if (!isStatic) omitted.add("style");
    const skip = (key: PropertyKey) =>
      typeof key === "string" && (key.charCodeAt(0) === 36 /* $ */ || omitted.has(key));
    const Yak = isStatic
      ? createStaticComponent(
          isTag ? targetComponent : undefined,
          renderTarget,
          runtimeStyleProcessor,
          skip,
        )
      : createDynamicComponent(renderTarget, mergedAttrsFn, runtimeStyleProcessor, skip);

    return Object.assign(Yak, {
      [yakComponentSymbol]: [
        Yak,
        mergedAttrsFn,
        runtimeStyleProcessor,
        targetComponent,
      ] satisfies ComponentMetadata,
    });
  };
};

const createStaticComponent = (
  tag: string | undefined,
  renderTarget: TargetRenderer,
  processor: StaticStyleProcessor,
  skip: (key: PropertyKey) => boolean,
): AnyComponent<Props> => {
  const staticClass = collectStaticClass(processor);
  const classOf = (props: Props): string | undefined => {
    const userClass = normalizeClass(props.class);
    if (!userClass) return staticClass;
    // The collector skips generated classes the user already supplied.
    const classes = new Classes(userClass);
    processor(props, classes);
    return classes.value || undefined;
  };
  const renderChildren =
    tag && !ambiguousSvgTags.has(tag) && !VOID_ELEMENTS.test(tag)
      ? createChildrenRenderer(tag, staticClass)
      : undefined;
  const meta: RenderMeta = { skip, classOf, compute: undefined, hasAttrs: false };
  return (props) => {
    // a reactive spread can add props later and needs the full client binding
    // on the server props are read once so the proxy check does not matter
    if (renderChildren && (isServer || !($PROXY in props))) {
      const keys = Object.keys(props);
      if (!keys.length || (keys.length === 1 && keys[0] === "children")) {
        return renderChildren(props, keys.length !== 0);
      }
    }
    return renderTarget(props, meta);
  };
};

const createDynamicComponent =
  (
    renderTarget: TargetRenderer,
    attrsFn: RuntimeAttrsFn | undefined,
    processor: StyleProcessor,
    skip: (key: PropertyKey) => boolean,
  ): AnyComponent<Props> =>
  (props) => {
    const theme = useTheme();
    const propsWithTheme = withTheme(props, theme);
    // attrs and styles run in one memo on purpose
    // a style-only prop change also reruns attrs, still cheaper than
    // two memos per element
    const compute = () => computeStyles(props, propsWithTheme, attrsFn, processor);
    // the server has no updates so a run-once cache replaces the memo
    // transparent memo: no hydration id is claimed for it
    const computed = isServer ? once(compute) : createMemo(compute, { transparent: true });
    // theme rules
    // style callbacks see an explicit theme prop before the provider theme
    // the target only gets a theme when attrs replaced the provider accessor,
    // otherwise it would end up on the dom element
    const allowTheme =
      attrsFn &&
      (() => {
        const attrs = computed().attrs;
        return !!attrs && "theme" in attrs && attrs.theme !== theme;
      });
    return renderTarget(props, {
      skip: allowTheme ? (key) => (key === "theme" ? !allowTheme() : skip(key)) : skip,
      compute: computed,
      classOf: undefined,
      hasAttrs: !!attrsFn,
    });
  };

/** Choose the target's render path once per styled component. */
const createTargetRenderer = (target: AnyComponent<any> | string): TargetRenderer => {
  if (typeof target !== "string") {
    return (props, meta) => createComponent(target, yakProps(props, meta));
  }
  if (isServer) {
    if (ambiguousSvgTags.has(target)) {
      // Match the client dynamic() memo and hydration IDs. Read props after taking the key.
      const render = dynamic(() => target) as (
        props: Record<string, unknown> | (() => Record<string, unknown>),
      ) => JSX.Element;
      return (props, meta) => render(() => serverProps(props, meta));
    }
    const isVoid = VOID_ELEMENTS.test(target);
    return (props, meta) => serializeElement(target, props, meta, isVoid);
  }
  const render = createElementRenderer(target);
  return (props, meta) => render(yakProps(props, meta));
};

/** Parse SVG and MathML children inside their namespace root. */
const createElementTemplate = (tag: string, className?: string) => {
  const classAttribute = className
    ? ` class="${className.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"`
    : "";
  const opening = `<${tag}${classAttribute}>`;
  // flag 2 returns firstChild.firstChild
  // skips the <svg>/<math> wrapper we add so the child parses in its namespace
  if (SVGElements.has(tag) && tag !== "svg") return template(`<svg>${opening}`, 2);
  if (MathMLElements.has(tag) && tag !== "math") return template(`<math>${opening}`, 2);
  return template(opening);
};

/** Bind a fixed client tag without dynamic()'s per-element memo. */
const createElementRenderer = (
  tag: string,
): ((props: Record<PropertyKey, unknown>) => JSX.Element) => {
  if (ambiguousSvgTags.has(tag)) {
    return dynamic(() => tag);
  }
  const create = createElementTemplate(tag);
  return (props) => {
    // Reuse SSR DOM during hydration; otherwise clone the cached template.
    const el = getNextElement(create);
    // A proxy can add children later, so it needs a child binding.
    spread(
      el,
      props,
      untrack(() => !($PROXY in props) && !("children" in props)),
    );
    // Replay events after the element's bindings are ready.
    runHydrationEvents();
    return el;
  };
};

/** Cache the tag and class; only children need a binding or serialization. */
const createChildrenRenderer = (
  tag: string,
  className: string | undefined,
): ((props: Props, hasChildren: boolean) => JSX.Element) => {
  if (isServer) {
    const parts = [
      `<${tag}`,
      `${className ? ` class="${ssrClassName(className)}"` : ""}>`,
      `</${tag}>`,
    ];
    return (props, hasChildren) => {
      const hk = ssrHydrationKey();
      return ssr(
        parts,
        hk,
        resolveSSRNode(hasChildren ? escape(props.children) : undefined, undefined, true),
      );
    };
  }
  const create = createElementTemplate(tag, className);
  return (props, hasChildren) => {
    const el = getNextElement(create);
    if (hasChildren) insert(el, () => props.children);
    runHydrationEvents();
    return el;
  };
};

/**
 * writes the html string by hand instead of using ssrElement
 * ssrElement needs a filtered props object with getters to keep the
 * read order, that costs more than writing directly
 */
const serializeElement = (
  tag: string,
  props: Props,
  meta: RenderMeta,
  skipChildren: boolean,
): JSX.Element => {
  // Take the element's key before reading props; a getter may render a child.
  const hk = ssrHydrationKey();
  const computed = meta.compute?.();
  const attrs = computed?.attrs;
  const className = classNameOf(props, meta);
  const style = computed?.style;
  let result = `<${tag}${hk}`;
  let children: unknown;
  // Child getters on void tags must stay unread to preserve hydration IDs.
  forEachProp(props, meta, attrs, (key, source) => {
    if (!ChildProperties.has(key)) result += attribute(key, source[key]);
    else if (children === undefined && !skipChildren)
      children = childContent(tag, key, source[key]);
  });
  if (className !== undefined) result += ` class="${ssrClassName(className)}"`;
  if (style !== undefined) result += ` style="${ssrStyle(style as Record<string, string>)}"`;
  // Void tags need no child resolution; return Solid's server node directly.
  if (skipChildren) return { t: result + "/>" } as JSX.Element;
  if (typeof children === "function") children = children();
  return ssr([result + ">", `</${tag}>`], resolveSSRNode(children, undefined, true));
};

/** Format one SSR attribute, including its leading space. */
const attribute = (prop: string, value: unknown): string => {
  if (prop === "style") return ` style="${ssrStyle(value as string)}"`;
  if (prop === "class") return ` class="${ssrClassName(value as string)}"`;
  // refs, event handlers and prop: bindings only exist on the client
  if (value == undefined || prop === "ref" || prop.startsWith("on") || prop.startsWith("prop:")) {
    return "";
  }
  if (typeof value === "boolean") return value ? ` ${escape(prop)}` : "";
  return value === "" ? ` ${escape(prop)}` : ` ${escape(prop)}="${escape(value, true)}"`;
};

/** Keep raw markup; escape other child values. */
const childContent = (tag: string, prop: string, value: unknown): unknown =>
  tag === "script" || tag === "style" || prop === "innerHTML" ? value : escape(value);

/**
 * the props the target sees: author props, attrs output, computed class and style
 * $-props and the provider theme are hidden, tags also lose `component`
 *
 * plain copy when the keys can't change, proxy when attrs or a reactive
 * spread can add keys and downstream omit() has to notice
 * the copy stays unmarked on purpose, a $PROXY mark makes omit()/merge()
 * wrap it again and every read gets slower
 */
const yakProps = (props: Props, meta: RenderMeta): Record<PropertyKey, unknown> => {
  if (!meta.hasAttrs && !($PROXY in props)) return copyProps(props, meta);
  return proxyProps(props, meta);
};

/**
 * copies descriptors without reading them
 * a getter like icon={<Icon />} renders a child and takes hydration ids,
 * the target has to read it in its own order
 * moving the getter is safe, solid's compiled getters do not depend on `this`
 */
const copyProps = (props: Props, meta: RenderMeta): Record<PropertyKey, unknown> => {
  const { compute, classOf } = meta;
  const classFn = compute ? () => compute().class : () => classOf(props);
  const styleFn = compute ? () => compute().style : undefined;
  const out: Record<PropertyKey, unknown> = {};
  for (const key of Reflect.ownKeys(props)) {
    if (meta.skip(key)) continue;
    const descriptor = Reflect.getOwnPropertyDescriptor(props, key)!;
    if ("value" in descriptor && descriptor.enumerable) {
      out[key] = descriptor.value;
    } else {
      Object.defineProperty(out, key, descriptor);
    }
  }
  Object.defineProperty(out, "class", {
    get: classFn,
    enumerable: true,
    configurable: true,
  });
  if (styleFn) {
    Object.defineProperty(out, "style", { get: styleFn, enumerable: true, configurable: true });
  }
  return out;
};

/**
 * Attrs and reactive spreads can add or remove keys. $PROXY keeps downstream
 * omit() calls reactive.
 */
const proxyProps = (props: Props, meta: RenderMeta): Record<PropertyKey, unknown> => {
  const { skip, compute, classOf } = meta;
  const attrsProps = () => (meta.hasAttrs ? meta.compute().attrs : undefined);
  const classFn = compute ? () => compute().class : () => classOf(props);
  const styleFn = compute ? () => compute().style : undefined;
  const contributed = (key: PropertyKey) =>
    key === "class" ? classFn : key === "style" ? styleFn : undefined;
  const fromAttrs = (key: PropertyKey) => {
    const attrs = attrsProps();
    return attrs && key in attrs ? attrs : undefined;
  };
  return new Proxy(props, {
    get(target, key) {
      if (key === $PROXY) return true;
      const getter = contributed(key);
      if (getter) return getter();
      if (skip(key)) return undefined;
      const attrs = fromAttrs(key);
      return attrs ? attrs[key] : Reflect.get(target, key);
    },
    has(target, key) {
      if (key === $PROXY) return true;
      if (contributed(key)) return true;
      if (skip(key)) return false;
      return Reflect.has(target, key) || fromAttrs(key) !== undefined;
    },
    ownKeys(target) {
      const keys = new Set<string | symbol>();
      for (const key of Reflect.ownKeys(target)) if (!skip(key)) keys.add(key);
      for (const key of Object.keys(attrsProps() ?? {})) if (!skip(key)) keys.add(key);
      // Class and computed style follow author props and attrs.
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
        return { enumerable: true, configurable: true, get: () => attrsProps()?.[key] };
      }
      return Reflect.getOwnPropertyDescriptor(target, key);
    },
  });
};

/** Build the props Solid reads for tags rendered through dynamic(). */
const serverProps = (props: Props, meta: RenderMeta): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  forEachProp(props, meta, meta.hasAttrs ? meta.compute().attrs : undefined, (key, source) => {
    out[key] = source[key];
  });
  // `ssrElement` writes `class=""` for an undefined class, so leave it out.
  const className = classNameOf(props, meta);
  if (className !== undefined) out.class = className;
  const style = meta.compute?.().style;
  if (style !== undefined) out.style = style;
  return out;
};

/** the class for one render, from the memo or the static class function */
const classNameOf = (props: Props, meta: RenderMeta): string | undefined =>
  meta.compute ? meta.compute().class : meta.classOf(props);

/** Visit author keys with attrs overrides, then keys added by attrs. */
const forEachProp = (
  props: Props,
  meta: RenderMeta,
  attrs: Props | undefined,
  visit: (key: string, source: Props) => void,
) => {
  for (const key of Object.keys(props)) {
    if (!meta.skip(key)) visit(key, attrs && key in attrs ? attrs : props);
  }
  if (!attrs) return;
  for (const key of Object.keys(attrs)) {
    if (!meta.skip(key) && !(key in props)) visit(key, attrs);
  }
};

/** Resolve attrs, then run styles against that props view. */
const computeStyles = (
  props: Props,
  propsWithTheme: Props,
  attrsFn: RuntimeAttrsFn | undefined,
  processor: StyleProcessor,
): ComputedStyles => {
  const attrs = attrsFn?.(propsWithTheme);
  const classes = new Classes(normalizeClass(props.class));
  const attrsClass = normalizeClass(attrs?.class);
  if (attrsClass) classes.add(attrsClass);
  // A static processor writes no style values, so the author's style object
  // can pass through without a copy.
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

/** Backing object of a theme proxy; each proxy holds its own props and theme. */
type ThemeProps = { props: Props; theme: Accessor<YakTheme> };

/** Shared across instances so no trap functions are created per element. */
const themeTraps: ProxyHandler<ThemeProps> = {
  get: ({ props, theme }, key) =>
    key === "theme" ? ("theme" in props ? props.theme : theme) : Reflect.get(props, key),
  has: ({ props }, key) => key === "theme" || Reflect.has(props, key),
  ownKeys: ({ props }) => {
    const keys = Reflect.ownKeys(props);
    return keys.includes("theme") ? keys : [...keys, "theme"];
  },
  getOwnPropertyDescriptor: ({ props, theme }, key) => {
    if (key === "theme" && !(key in props)) {
      return { value: theme, enumerable: true, configurable: true };
    }
    const descriptor = Reflect.getOwnPropertyDescriptor(props, key);
    // These virtual props must stay configurable on the proxy's backing object.
    return descriptor && { ...descriptor, configurable: true };
  },
};

/** Use the provider theme when props has no theme. Other reads stay reactive. */
const withTheme = (props: Props, theme: Accessor<YakTheme>): Props =>
  (!($PROXY in props) && "theme" in props
    ? props
    : new Proxy({ props, theme }, themeTraps)) as Props;

/**
 * Let style interpolations read attrs over author props. Read getters only
 * when the interpolation asks for that key.
 */
const withAttrs = (props: Props, attrs: Props): Props =>
  new Proxy(
    {},
    {
      get: (_, key) => (key in attrs ? Reflect.get(attrs, key) : Reflect.get(props, key)),
      has: (_, key) => key in attrs || key in props,
      ownKeys: () => [...new Set([...Reflect.ownKeys(props), ...Reflect.ownKeys(attrs)])],
      getOwnPropertyDescriptor: (_, key) => {
        const descriptor = Reflect.getOwnPropertyDescriptor(key in attrs ? attrs : props, key);
        return descriptor && { ...descriptor, configurable: true };
      },
    },
  );

/** Convert string styles before adding CSS variables. */
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

/** cheaper than Object.keys(object).length, no array for a yes/no answer */
const hasKeys = (object: object): boolean => {
  for (const _ in object) return true;
  return false;
};

/** Run once and reuse the result. */
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

/** Collect static classes without reading props. */
const collectStaticClass = (processor: StaticStyleProcessor): string | undefined => {
  const classes = new Classes();
  processor(undefined, classes);
  return classes.value || undefined;
};

/** Apply parent attrs first, then let own attrs read and override that result. */
const composeAttrs = (
  attrs?: RuntimeAttrs,
  parentAttrsFn?: RuntimeAttrsFn,
): RuntimeAttrsFn | undefined => {
  const ownAttrsFn = attrs && (typeof attrs === "function" ? attrs : () => attrs);
  if (!ownAttrsFn) return parentAttrsFn;
  if (!parentAttrsFn) return ownAttrsFn;
  return (props) => {
    const parentProps = parentAttrsFn(props);
    return combineProps(parentProps, ownAttrsFn(combineProps(props, parentProps)));
  };
};

/** Run parent styles before own styles, with one collector and style object. */
const composeStyles = (own: StyleProcessor, parent?: StyleProcessor): StyleProcessor => {
  if (!parent) return own;
  // The flag covers both processors; neither needs a style object when it is false.
  return Object.assign(
    (props: unknown, classes: Parameters<StyleProcessor>[1], style: StyleObject) => {
      parent(props, classes, style);
      own(props, classes, style);
    },
    { $dynamic: own.$dynamic || parent.$dynamic },
  ) as StyleProcessor;
};

/** Attrs override props; class and style values combine. */
const combineProps = (props: Props, newProps: Props | null | undefined): Props => {
  if (!newProps) return props;
  // shortcut when nothing needs merging
  // an equal class counts as nothing: own attrs get the combined props and
  // may hand the same class back, merging it again would duplicate it
  if (
    (props.class === newProps.class || !newProps.class) &&
    (props.style === newProps.style || !newProps.style)
  )
    return { ...props, ...newProps };
  return {
    ...props,
    ...newProps,
    class: mergeClasses(props.class, newProps.class),
    style: { ...unwrapStyle(props.style), ...unwrapStyle(newProps.style) },
  };
};

/** Join nonempty class names with a space. */
const mergeClasses = (a?: string, b?: string) => {
  if (!a) return b || undefined;
  return b ? a + " " + b : a;
};
