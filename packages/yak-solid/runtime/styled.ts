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
import { $PROXY, createMemo, getOwner, runWithOwner, sharedConfig, untrack } from "solid-js";
import {
  ChildProperties,
  createComponent,
  escape,
  getNextElement,
  insert,
  isServer,
  MathMLElements,
  Namespaces,
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
// the server build of @solidjs/web has no getInsertionParent export, and a
// named import of a missing name fails at module load; the namespace read is
// only reached on the client
import * as solidWeb from "@solidjs/web";
import { mergeClasses, normalizeClass } from "./internals/mergeClasses.js";
// the runtime and the app share one theme context; vite can alias this export
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
  /** true when the class holds generated names only, nothing from the author or attrs */
  generatedClass: boolean;
  style: StyleObject | undefined;
  attrs: Props | undefined;
};

/**
 * the information to build class and style for one render
 * kept outside of the component props so solid never copies or filters
 * it when it walks the props object
 */
type RenderMeta = StaticMeta | DynamicMeta;

/** static component: the class comes from classOf, one per component */
type StaticMeta = {
  skip: (key: PropertyKey) => boolean;
  compute: undefined;
  classOf: (props: Props) => string | undefined;
  hasAttrs: false;
  /** the generated class, the writer's escape-free case */
  staticClass: string | undefined;
};

/**
 * dynamic component: one memo (run once on the server) holds class,
 * style and attrs, one meta per element. hasAttrs stays a static flag:
 * an attrs function may add keys later, so the copy-or-proxy choice
 * cannot read the memo. both literals keep the same keys in the same
 * order so every meta read sees one shape
 */
type DynamicMeta = {
  skip: (key: PropertyKey) => boolean;
  compute: () => ComputedStyles;
  classOf: undefined;
  hasAttrs: boolean;
  staticClass: undefined;
};

/** what a styled component built on another yak component inherits from it */
type ComponentMetadata = readonly [
  attrs: RuntimeAttrs | undefined,
  styles: StyleProcessor,
  target: AnyComponent<any> | string,
];

type TargetRenderer = (props: Props, meta: RenderMeta) => JSX.Element;

/** create a styled tag or component, with optional attrs */
export type StyledInternal = <
  T extends object,
  TAttrsIn extends object = {},
  TAttrsOut extends AttrsMerged<T, TAttrsIn> = AttrsMerged<T, TAttrsIn>,
>(
  Component: AnyComponent<T> | YakComponent<T> | HtmlTags | string,
  attrs?: Attrs<T, TAttrsIn, TAttrsOut>,
) => StyledLiteral<Substitute<T, TAttrsIn>>;

/** these tags exist in html and svg; a fresh mount picks the namespace from the insertion parent */
const ambiguousSvgTags = new Set(["a", "script", "style", "title"]);

/** object attrs bake when every entry is a plain attribute with a primitive value */
const bakeable = (attrs: Props): boolean =>
  Object.getOwnPropertyNames(attrs).every((key) => {
    // a getter is read at render time, not here
    const descriptor = Object.getOwnPropertyDescriptor(attrs, key)!;
    if (!("value" in descriptor)) return false;
    const type = typeof descriptor.value;
    return (
      (type === "string" || type === "number" || type === "boolean" || descriptor.value == null) &&
      key.charCodeAt(0) !== 36 &&
      key !== "class" &&
      key !== "style" &&
      key !== "theme" &&
      key !== "ref" &&
      !ChildProperties.has(key) &&
      !key.startsWith("on") &&
      !key.startsWith("prop:")
    );
  });

/** the attribute string of baked attrs, same rules as the server writer, built once */
const attributes = (attrs: Props): string => {
  let result = "";
  for (const key of Object.keys(attrs)) {
    const value = attrs[key];
    if (value == null || value === false) continue;
    result +=
      value === true || value === "" ? ` ${key}` : ` ${key}="${escapeAttribute(String(value))}"`;
  }
  return result;
};

const escapeAttribute = (value: string) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

const VOID_ELEMENTS =
  /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;

const styledFactory: StyledFn = (Component) =>
  Object.assign(yakStyled(Component), {
    attrs: (attrs: Attrs<any>) => yakStyled(Component, attrs),
  });

/** style a tag or a component that forwards its class prop */
export const styled = styledFactory as Styled;

const yakStyled: StyledInternal = (Component, attrs) => {
  // solid-refresh forwards reads to the live component, but does not forward `in` checks.
  const isYakComponent =
    typeof Component === "function" &&
    (Component as Partial<YakComponent<unknown>>)[yakComponentSymbol] !== undefined;

  // parent attrs and styles run before this component's own
  // the public tuple type hides the shape, one cast at the read
  const [parentAttrs, parentRuntimeStylesFn, parentTarget] = isYakComponent
    ? ((Component as YakComponent<unknown>)[yakComponentSymbol] as ComponentMetadata)
    : [];

  // the chain renders its final target once, with all attrs and style processors combined
  const targetComponent = parentTarget ?? Component;

  const mergedAttrs = composeAttrs(attrs as RuntimeAttrs | undefined, parentAttrs);

  return (styles, ...values) => {
    const runtimeStylesFn = css(styles, ...values);
    const runtimeStyleProcessor = composeStyles(runtimeStylesFn, parentRuntimeStylesFn);

    const isTag = typeof targetComponent === "string";
    // object attrs with plain attribute values bake into the tag's opening
    // string and template; the component stays static
    const baked =
      isTag && mergedAttrs && typeof mergedAttrs !== "function" && bakeable(mergedAttrs)
        ? mergedAttrs
        : undefined;
    const renderTarget = createTargetRenderer(targetComponent, baked ? attributes(baked) : "");
    const isStatic = (!mergedAttrs || !!baked) && !runtimeStyleProcessor.$dynamic;
    // the target never sees $-props, the provider theme, or the author class
    // (yak hands it the combined one); a dynamic component owns style too.
    // no symbol passes: solid's merge() flattens any object that answers its
    // private $SOURCES key, which would hand a target's mergeProps() the
    // unfiltered originals; solid's own omit() blocks that key the same way
    const skip = (key: PropertyKey) =>
      typeof key !== "string" ||
      key.charCodeAt(0) === 36 /* $ */ ||
      key === "class" ||
      key === "theme" ||
      (!isStatic && key === "style") ||
      // a baked attr wins over the author's prop of the same name
      (baked !== undefined && Object.hasOwn(baked, key));
    const attrsFn =
      typeof mergedAttrs === "function" ? mergedAttrs : mergedAttrs && (() => mergedAttrs);
    const Yak = isStatic
      ? createStaticComponent(
          isTag ? targetComponent : undefined,
          renderTarget,
          runtimeStyleProcessor,
          skip,
          baked ? attributes(baked) : "",
        )
      : createDynamicComponent(renderTarget, attrsFn, runtimeStyleProcessor, skip);

    const metadata: ComponentMetadata = [mergedAttrs, runtimeStyleProcessor, targetComponent];
    return Object.assign(Yak, { [yakComponentSymbol]: metadata });
  };
};

const createStaticComponent = (
  tag: string | undefined,
  renderTarget: TargetRenderer,
  processor: StaticStyleProcessor,
  skip: (key: PropertyKey) => boolean,
  attrString: string,
): AnyComponent<Props> => {
  const collected = new Classes();
  processor(undefined, collected);
  const staticClass = collected.value || undefined;
  const classOf = (props: Props): string | undefined => {
    const userClass = normalizeClass(props.class);
    if (!userClass) return staticClass;
    // the collector skips generated names the author's class already holds
    const classes = new Classes(userClass);
    processor(props, classes);
    return classes.value || undefined;
  };
  const renderChildren =
    // the namespace question of the four ambiguous tags exists only on a fresh client mount
    tag && (isServer || !ambiguousSvgTags.has(tag)) && !VOID_ELEMENTS.test(tag)
      ? createChildrenRenderer(tag, staticClass, attrString)
      : undefined;
  // the writer prints the class unescaped only when it is this exact string;
  // with an atom in it (author text) this stays undefined and the writer escapes
  const meta: RenderMeta = {
    skip,
    compute: undefined,
    classOf,
    hasAttrs: false,
    staticClass: collected.generated ? staticClass : undefined,
  };
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
    // the server has no updates, so a run-once closure replaces the memo:
    // solid's server memo builds an owner and a computation record per element
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
      staticClass: undefined,
    });
  };

/** the target's render path, chosen once per styled component */
const createTargetRenderer = (
  target: AnyComponent<any> | string,
  attrString: string,
): TargetRenderer => {
  if (typeof target !== "string") {
    return (props, meta) => createComponent(target, yakProps(props, meta));
  }
  if (isServer) {
    // the opening string with baked attrs and the closing tag are built once here
    const open = `<${target}${attrString}`;
    const closing = VOID_ELEMENTS.test(target) ? undefined : `</${target}>`;
    return (props, meta) => serializeElement(target, open, closing, props, meta);
  }
  return createElementRenderer(target, attrString);
};

/** Parse SVG and MathML children inside their namespace root. */
const createElementTemplate = (tag: string, attrString: string, className?: string) => {
  // atoms can put author names into the static class, so the template escapes it
  const classAttribute = className ? ` class="${escapeAttribute(className)}"` : "";
  const opening = `<${tag}${attrString}${classAttribute}>`;
  // flag 2 returns firstChild.firstChild
  // skips the <svg>/<math> wrapper we add so the child parses in its namespace
  if (SVGElements.has(tag) && tag !== "svg") return template(`<svg>${opening}`, 2);
  if (MathMLElements.has(tag) && tag !== "math") return template(`<math>${opening}`, 2);
  return template(opening);
};

/** bind a fixed client tag without dynamic()'s per-element memo */
const createElementRenderer = (tag: string, attrString: string): TargetRenderer => {
  const create = createElementTemplate(tag, attrString);
  if (!ambiguousSvgTags.has(tag)) {
    // Reuse SSR DOM during hydration; otherwise clone the cached template.
    return (props, meta) => bindElement(getNextElement(create), props, meta);
  }
  // a, script, style and title exist in html and svg. hydration claims the
  // node the server wrote. a fresh mount learns the namespace from the
  // insertion parent, which solid sets only while the parent inserts, so
  // creation waits for that call, the way solid's own dynamic() does
  const createSvg = template(`<svg><${tag}${attrString}>`, 2);
  return (props, meta) => {
    if (sharedConfig.hydrating) return bindElement(getNextElement(create), props, meta);
    const owner = getOwner();
    let el: Element | undefined;
    // the thunk runs inside the parent's insert effect with tracking on;
    // untrack keeps that effect from subscribing to the prop reads here
    const lazy = () =>
      (el ??= runWithOwner(owner, () =>
        untrack(() => {
          // declared as a Node; the namespace and local name live on Element
          const parent = solidWeb.getInsertionParent() as Element | undefined;
          const inSvg =
            !!parent &&
            parent.namespaceURI === Namespaces.svg &&
            parent.localName !== "foreignObject";
          return bindElement((inSvg ? createSvg : create)(), props, meta);
        }),
      ));
    // insert() accepts an accessor at runtime (dynamic() returns one), the
    // JSX.Element type does not include it
    return lazy as unknown as JSX.Element;
  };
};

/** apply the props to a created or claimed element */
const bindElement = (el: Element, props: Props, meta: RenderMeta): Element => {
  const bound = yakProps(props, meta);
  // a proxy can add children later, so it keeps the child binding
  // component bodies run untracked already, and the lazy mount untracks itself
  spread(el, bound, !($PROXY in bound) && !("children" in bound));
  // replay events once the element's bindings are ready
  runHydrationEvents();
  return el;
};

/** tag and class cached per component; only the children need a binding or serialization */
const createChildrenRenderer = (
  tag: string,
  className: string | undefined,
  attrString: string,
): ((props: Props, hasChildren: boolean) => JSX.Element) => {
  if (isServer) {
    const head = `<${tag}${attrString}`;
    const open = `${className ? ` class="${ssrClassName(className)}"` : ""}>`;
    const closing = `</${tag}>`;
    const parts = [head, open, closing];
    return (props, hasChildren): { t: string } => {
      // the key comes before the child getter runs, it may render
      const hk = ssrHydrationKey();
      const children = hasChildren ? escape(props.children) : undefined;
      // plain children join in place like in serializeElement; the rest is
      // a hole for ssr(), as in compiled templates
      const text = plainContent(children);
      if (text !== undefined) return { t: `${head}${hk}${open}${text}${closing}` };
      return ssr(parts, hk, children);
    };
  }
  const create = createElementTemplate(tag, attrString, className);
  return (props, hasChildren) => {
    const el = getNextElement(create);
    if (hasChildren) {
      // static text compiles to a data property: one insert, no effect node.
      // a getter is dynamic and keeps the binding
      const descriptor = Object.getOwnPropertyDescriptor(props, "children");
      if (descriptor && "value" in descriptor) insert(el, descriptor.value);
      else insert(el, () => props.children);
    }
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
  open: string,
  closing: string | undefined,
  props: Props,
  meta: RenderMeta,
): { t: string } => {
  // the key comes before any prop read: a getter may render a child and take keys
  const hk = ssrHydrationKey();
  // one memo read for class, style and attrs
  let computed: ComputedStyles | undefined;
  let className: string | undefined;
  if (meta.compute) {
    computed = meta.compute();
    className = computed.class;
  } else {
    className = meta.classOf(props);
  }
  const attrs = computed?.attrs;
  const style = computed?.style;
  const skip = meta.skip;
  let result = open + hk;
  let children: unknown;
  // author keys first, an attrs value wins; then the keys only attrs has.
  // two loops on purpose: one loop over both key sets costs more on the
  // attrs path (the push and a second `in` per key).
  // only the first child prop is read, and none on a void tag: a child
  // getter may render and take hydration ids
  for (const key of Object.keys(props)) {
    if (skip(key)) continue;
    const source = attrs && key in attrs ? attrs : props;
    if (!ChildProperties.has(key)) result += attribute(key, source[key]);
    else if (children === undefined && closing) children = childContent(tag, key, source[key]);
  }
  if (attrs) {
    for (const key of Object.keys(attrs)) {
      if (skip(key) || key in props) continue;
      if (!ChildProperties.has(key)) result += attribute(key, attrs[key]);
      else if (children === undefined && closing) children = childContent(tag, key, attrs[key]);
    }
  }
  // generated class names need no escaping, an author or attrs class does
  if (className !== undefined) {
    const generated = computed ? computed.generatedClass : className === meta.staticClass;
    result += ` class="${generated ? className : ssrClassName(className)}"`;
  }
  if (style !== undefined) result += ` style="${ssrStyle(style as Record<string, string>)}"`;
  // a void tag has no children; solid's server node is the string itself
  if (!closing) return { t: result + "/>" };
  // a function child goes to ssr() too: it runs the hole with the async
  // wrap and error boundary routing a direct call would skip
  // text and finished nodes join in place, which is what solid's own
  // resolver does with them. arrays and async holes go to ssr() as a hole,
  // the way compiled templates pass children: it puts the separator marker
  // between adjacent text items so the client can claim two text nodes
  const text = plainContent(children);
  if (text !== undefined) return { t: result + ">" + text + closing };
  return ssr([result + ">", closing], children);
};

/** the string a child resolves to when it needs no resolver, else undefined */
const plainContent = (node: unknown): string | undefined => {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (node == null || typeof node === "boolean") return "";
  if (typeof node !== "object" || Array.isArray(node)) return undefined;
  const server = node as { t?: unknown; h?: unknown[] };
  if (server.h && server.h.length > 0) return undefined;
  if (typeof server.t === "string") return server.t;
  if (Array.isArray(server.t) && server.t.length === 1) return server.t[0] as string;
  return undefined;
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

/** raw markup stays as is, every other child value is escaped */
const childContent = (tag: string, prop: string, value: unknown): unknown =>
  tag === "script" || tag === "style" || prop === "innerHTML" ? value : escape(value);

/**
 * the props the target sees: author props, attrs output, computed class and style
 * $-props and the provider theme are hidden. solid's omit() takes fixed key
 * names and $-props are open-ended, so the filter is hand-written
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
  const styleFn = styleGetter(compute);
  const out: Record<PropertyKey, unknown> = {};
  // string keys only, like solid's omit(): a symbol never reaches the target
  for (const key of Object.getOwnPropertyNames(props)) {
    if (meta.skip(key)) continue;
    const descriptor = Reflect.getOwnPropertyDescriptor(props, key)!;
    if ("value" in descriptor && descriptor.enumerable) {
      out[key] = descriptor.value;
    } else {
      Object.defineProperty(out, key, descriptor);
    }
  }
  if (isServer) {
    // the values are final on the server: data properties take the value
    // path in solid's omit() and merge() instead of a getter per read
    out.class = classFn();
    if (styleFn) out.style = styleFn();
    return out;
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
 * the style accessor a component target receives, or none
 * on the server the value is final, and a target that spreads its props
 * into ssrElement would write style="" for an undefined one; on the client
 * the accessor stays so the memo can set a style later
 */
const styleGetter = (
  compute: (() => ComputedStyles) | undefined,
): (() => StyleObject | undefined) | undefined => {
  if (!compute) return undefined;
  if (isServer && compute().style === undefined) return undefined;
  return () => compute().style;
};

/**
 * attrs and reactive spreads can add or remove keys; the $PROXY mark keeps
 * downstream omit() calls reactive
 */
const proxyProps = (props: Props, meta: RenderMeta): Record<PropertyKey, unknown> => {
  const { skip, compute, classOf } = meta;
  const attrsProps = () => (meta.hasAttrs ? meta.compute().attrs : undefined);
  const classFn = compute ? () => compute().class : () => classOf(props);
  const styleFn = styleGetter(compute);
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
      // class and the computed style follow the author props and attrs
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

/** resolve attrs, then run the styles against that props view */
const computeStyles = (
  props: Props,
  propsWithTheme: Props,
  attrsFn: RuntimeAttrsFn | undefined,
  processor: StyleProcessor,
): ComputedStyles => {
  const attrs = attrsFn?.(propsWithTheme);
  const authorClass = normalizeClass(props.class);
  const classes = new Classes(authorClass);
  const attrsClass = normalizeClass(attrs?.class);
  if (attrsClass) classes.add(attrsClass);
  // a static processor writes no style values, so the author's style object
  // passes through without a copy
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
    generatedClass: !authorClass && !attrsClass && classes.generated,
    style: style && hasKeys(style) ? style : undefined,
    attrs,
  };
};

/**
 * backing object of a props view: the author's props, a provider theme to
 * fill in when props has none, and attrs whose values win over props.
 * one shared handler serves both views, so a view costs one proxy and one
 * small object per element and no trap closures
 */
type View = { props: Props; theme?: Accessor<YakTheme>; attrs?: Props };

const viewTraps: ProxyHandler<View> = {
  get: ({ props, theme, attrs }, key) => {
    if (key === "theme" && theme && !("theme" in props)) return theme;
    if (attrs && key in attrs) return Reflect.get(attrs, key);
    return Reflect.get(props, key);
  },
  has: ({ props, theme, attrs }, key) =>
    (key === "theme" && !!theme) || (!!attrs && key in attrs) || Reflect.has(props, key),
  ownKeys: ({ props, theme, attrs }) => {
    const keys = new Set(Reflect.ownKeys(props));
    if (attrs) for (const key of Reflect.ownKeys(attrs)) keys.add(key);
    if (theme) keys.add("theme");
    return [...keys];
  },
  getOwnPropertyDescriptor: ({ props, theme, attrs }, key) => {
    if (key === "theme" && theme && !("theme" in props)) {
      return { value: theme, enumerable: true, configurable: true };
    }
    const descriptor = Reflect.getOwnPropertyDescriptor(attrs && key in attrs ? attrs : props, key);
    // a virtual prop must report configurable, the backing object has no such key
    return descriptor && { ...descriptor, configurable: true };
  },
};

/** the provider theme when props has none; other reads stay reactive */
const withTheme = (props: Props, theme: Accessor<YakTheme>): Props =>
  (!($PROXY in props) && "theme" in props
    ? props
    : new Proxy({ props, theme }, viewTraps)) as Props;

/** style interpolations read attrs over author props, getters only on demand */
const withAttrs = (props: Props, attrs: Props): Props =>
  new Proxy({ props, attrs }, viewTraps) as Props;

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

/** run once and reuse the result */
const once = <T extends object>(fn: () => T): (() => T) => {
  let value: T | undefined;
  return () => (value ??= fn());
};

/** parent attrs first, then own attrs read and override that result */
const composeAttrs = (attrs?: RuntimeAttrs, parent?: RuntimeAttrs): RuntimeAttrs | undefined => {
  if (!attrs) return parent;
  if (!parent) return attrs;
  // two objects combine once here and stay an object
  if (typeof attrs !== "function" && typeof parent !== "function")
    return combineProps(parent, attrs);
  const own = typeof attrs === "function" ? attrs : () => attrs;
  const parentFn = typeof parent === "function" ? parent : () => parent;
  return (props) => {
    const parentProps = parentFn(props);
    return combineProps(parentProps, own(combineProps(props, parentProps)));
  };
};

/** parent styles before own styles, with one collector and one style object */
const composeStyles = (own: StyleProcessor, parent?: StyleProcessor): StyleProcessor => {
  if (!parent) return own;
  // the flag covers both processors; neither needs a style object when it is false
  return Object.assign(
    (props: unknown, classes: Parameters<StyleProcessor>[1], style: StyleObject) => {
      parent(props, classes, style);
      own(props, classes, style);
    },
    { $dynamic: own.$dynamic || parent.$dynamic },
  ) as StyleProcessor;
};

/** attrs override props; class and style values combine */
const combineProps = (props: Props, newProps: Props | null | undefined): Props => {
  if (!newProps) return props;
  // descriptors, not values: a spread would run every author getter here,
  // and a children getter renders (twice, and on the server with the
  // wrong hydration ids); the target reads it once, in its own order
  const out = Object.defineProperties({}, Object.getOwnPropertyDescriptors(props)) as Props;
  Object.defineProperties(out, Object.getOwnPropertyDescriptors(newProps));
  // an equal class counts as nothing: own attrs get the combined props and
  // may hand the same class back, merging it again would duplicate it
  if (newProps.class && props.class !== newProps.class) {
    define(out, "class", mergeClasses(normalizeClass(props.class), newProps.class));
  }
  if (newProps.style && props.style !== newProps.style) {
    define(out, "style", { ...unwrapStyle(props.style), ...unwrapStyle(newProps.style) });
  }
  return out;
};

/** replace a copied prop, which may be a getter, with a value */
const define = (object: object, key: string, value: unknown) =>
  Object.defineProperty(object, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
