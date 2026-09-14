// the compiler extracts the css at build time; this file only builds class
// and style per element, prints the tag on the server and binds it on the
// client. the map, for a reader who lands in the middle:
//
// styled() flattens a chain of styled components and picks one of two
// component shapes at definition. static: the class is fixed, there is no
// attrs function and the css block writes no style values at render time,
// so no memo and no theme read. dynamic: one memo per element resolves
// attrs, class and style.
//
// both hand the target a RenderMeta and a props view. on the server
// serializeElement (the writer) prints a tag, on the client bindElement
// spreads onto a cloned template, a component target gets targetProps
// (a copy or a proxy).
//
// words: author = the app code that writes the css block, renders the
// component and passes props; target = the tag or component under the
// styled layer; attrs = the .attrs() values, an object or a function of
// props; baked = object attrs printed into the tag at definition; view = a
// proxy over props that adds the theme or attrs; atom = a class name the
// author passes into a css block (atoms("...")), which makes the class
// author text that is escaped
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
import { $PROXY, createMemo } from "solid-js";
// solid's compiled-jsx helpers: this file hand-writes what the compiler emits for a tag
import {
  ChildProperties,
  createComponent,
  DOMWithState,
  escape,
  getNextElement,
  insert,
  isServer,
  MathMLElements,
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
import { mergeClasses, normalizeClass } from "./internals/mergeClasses.js";
// the runtime and the app share one theme context; vite can alias this export
import { useTheme } from "@yak/solid/context";
import type { YakTheme } from "./context/index.js";
import type { Accessor } from "solid-js";

/** the props a styled component receives from its author; theme is an accessor (the provider's or the author's) */
type Props = {
  class?: string;
  style?: StyleObject | string;
  theme?: Accessor<YakTheme>;
} & Record<PropertyKey, unknown>;

/**
 * the compiled css block: adds its class names to the collector and, when
 * $dynamic, style values for the props; the css itself is extracted at build time
 */
type StyleProcessor = CompiledStyleProcessor<unknown>;

type RuntimeAttrsFn = (props: Props) => Props;

/** the .attrs() values: an object, or a function of the author's props */
type RuntimeAttrs = Props | RuntimeAttrsFn;

type ComputedStyles = {
  class: string | undefined;
  /** true when the class holds generated names only, nothing from the author or attrs; the writer prints it unescaped then */
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

/** static component (fixed class, no attrs function, no style values at render time): one meta per component, the class comes from classOf */
type StaticMeta = {
  /** keys the target must never see; the rule is built once in yakStyled */
  skip: (key: PropertyKey) => boolean;
  compute: undefined;
  classOf: (props: Props) => string | undefined;
  attrsAddKeys: false;
  /** the static class when every name in it is generated, so the writer prints it unescaped; undefined when an atom put author text in it */
  unescapedClass: string | undefined;
};

/**
 * dynamic component: one memo (run once on the server) holds class,
 * style and attrs, one meta per element. the two meta literals (in
 * createStaticComponent and createDynamicComponent) keep the same keys in
 * the same order so every meta read sees one shape; a flat shape with
 * accessors instead of the direct compute field measured slower
 */
type DynamicMeta = {
  skip: (key: PropertyKey) => boolean;
  compute: () => ComputedStyles;
  classOf: undefined;
  /**
   * an attrs function may add keys at render time, so the target gets a
   * proxy, not a copy. decided at definition: the memo's current attrs say
   * nothing about later runs
   */
  attrsAddKeys: boolean;
  unescapedClass: undefined;
};

/** what a styled component built on another yak component inherits from it */
type ComponentMetadata = readonly [
  attrs: RuntimeAttrs | undefined,
  styles: StyleProcessor,
  target: AnyComponent<any> | string,
];

/** renders one element of the flattened target: props are the author's raw props, meta says how to build class and style */
type TargetRenderer = (props: Props, meta: RenderMeta) => JSX.Element;

/** the loosely typed form of Styled that yakStyled implements; the public overloads live in publicStyledApi */
export type StyledInternal = <
  T extends object,
  TAttrsIn extends object = {},
  TAttrsOut extends AttrsMerged<T, TAttrsIn> = AttrsMerged<T, TAttrsIn>,
>(
  Component: AnyComponent<T> | YakComponent<T> | HtmlTags | string,
  attrs?: Attrs<T, TAttrsIn, TAttrsOut>,
) => StyledLiteral<Substitute<T, TAttrsIn>>;

/** solid's server regex (not exported); its VoidElements set lacks keygen and menuitem */
const VOID_ELEMENTS =
  /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;

const styledFactory: StyledFn = (Component) =>
  Object.assign(yakStyled(Component), {
    attrs: (attrs: Attrs<any>) => yakStyled(Component, attrs),
  });

/**
 * style a tag or a component that forwards its class prop. styled.div is
 * compiled to styled("div"); the untransformed export in mocks/styled.ts
 * adds the tag properties with a proxy
 */
export const styled = styledFactory as Styled;

const yakStyled: StyledInternal = (Component, attrs) => {
  // solid-refresh forwards reads to the live component, but does not forward `in` checks
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
    // after compilation styles and values hold class names, style callbacks
    // and css-variable maps, no css text
    const runtimeStylesFn = css(styles, ...values);
    const runtimeStyleProcessor = composeStyles(runtimeStylesFn, parentRuntimeStylesFn);

    const isTag = typeof targetComponent === "string";
    // object attrs with plain attribute values bake into the tag's opening
    // string and template; the component stays static. baked keys reach the
    // dom only through that string: skip drops them from the target
    const baked =
      isTag &&
      mergedAttrs &&
      typeof mergedAttrs !== "function" &&
      bakeable(targetComponent, mergedAttrs)
        ? mergedAttrs
        : undefined;
    const attrString = baked ? bakeAttributes(baked) : "";
    const renderTarget = createTargetRenderer(targetComponent, attrString);
    // static: attrs are none or baked, and the css block writes no style values
    const isStatic = (!mergedAttrs || !!baked) && !runtimeStyleProcessor.$dynamic;
    // the target never sees $-props, the provider theme, or the author class
    // (yak hands it the combined one); a dynamic component merges style in its
    // memo, so the author's style key is dropped here and handed over combined.
    // no symbol passes: solid's merge() flattens any object that answers its
    // private $SOURCES key, which would hand a target's mergeProps() the
    // unfiltered originals; solid's own omit() blocks that key the same way
    const skip = (key: PropertyKey) =>
      typeof key !== "string" ||
      key.charCodeAt(0) === 36 /* $ */ ||
      key === "class" ||
      key === "theme" ||
      (!isStatic && key === "style") ||
      // a baked attr wins over the author's prop of the same name, even when its value is null
      (baked !== undefined && Object.hasOwn(baked, key));
    const attrsFn =
      typeof mergedAttrs === "function" ? mergedAttrs : mergedAttrs && (() => mergedAttrs);
    const Yak = isStatic
      ? createStaticComponent(
          isTag ? targetComponent : undefined,
          renderTarget,
          runtimeStyleProcessor,
          skip,
          attrString,
        )
      : createDynamicComponent(renderTarget, attrsFn, runtimeStyleProcessor, skip, !!baked);

    const metadata: ComponentMetadata = [mergedAttrs, runtimeStyleProcessor, targetComponent];
    return Object.assign(Yak, { [yakComponentSymbol]: metadata });
  };
};

/**
 * object attrs bake when every entry is a plain attribute with a primitive
 * value. rejected keys are the union of what skip drops, what attribute()
 * treats specially, and what solid sets as a dom property (DOMWithState:
 * value, checked, ...), which a template would turn into a content
 * attribute. enumerable data keys only, so the three walks (here,
 * bakeAttributes, skip) see the same keys; a getter blocks baking and runs
 * at render time
 */
const bakeable = (tag: string, attrs: Props): boolean => {
  const stateful = DOMWithState[tag.toUpperCase()];
  return Object.getOwnPropertyNames(attrs).every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(attrs, key)!;
    if (!descriptor.enumerable || !("value" in descriptor)) return false;
    const type = typeof descriptor.value;
    return (
      (type === "string" || type === "number" || type === "boolean" || descriptor.value == null) &&
      // the name goes into the template and the opening string unescaped; anything
      // else (a computed key with markup in it) takes the writer, whose attribute() escapes names
      ATTRIBUTE_NAME.test(key) &&
      key.charCodeAt(0) !== 36 &&
      key !== "class" &&
      key !== "style" &&
      key !== "theme" &&
      key !== "ref" &&
      !ChildProperties.has(key) &&
      !key.startsWith("on") &&
      !key.startsWith("prop:") &&
      !(stateful && key in stateful)
    );
  });
};

/**
 * the attribute string of baked attrs, built once at definition. the value
 * rules follow attribute(), the per-prop server writer; the escaping is
 * local because the client build's escape is an empty stub, and attribute
 * names are code constants. `<` stays unescaped, harmless in a quoted value
 */
const bakeAttributes = (attrs: Props): string => {
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

/** an attribute name that needs no escaping in markup */
const ATTRIBUTE_NAME = /^[A-Za-z_:][\w:.-]*$/;

/** parent attrs first, then own attrs read and override that result */
const composeAttrs = (attrs?: RuntimeAttrs, parent?: RuntimeAttrs): RuntimeAttrs | undefined => {
  if (!attrs) return parent;
  if (!parent) return attrs;
  // two objects without getters combine once here and stay an object; a
  // getter must run per render, inside the memo
  if (
    typeof attrs !== "function" &&
    typeof parent !== "function" &&
    !hasGetter(attrs) &&
    !hasGetter(parent)
  ) {
    return combineProps(parent, attrs);
  }
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
  // when $dynamic is false no processor touches the style object
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
  const descriptors = {
    ...Object.getOwnPropertyDescriptors(props),
    ...Object.getOwnPropertyDescriptors(newProps),
  };
  // an equal class counts as nothing: own attrs get the combined props and
  // may hand the same class back, merging it again would duplicate it
  if (newProps.class && props.class !== newProps.class) {
    descriptors.class = valueDescriptor(mergeClasses(normalizeClass(props.class), newProps.class));
  }
  if (newProps.style && props.style !== newProps.style) {
    descriptors.style = valueDescriptor({
      ...unwrapStyle(props.style),
      ...unwrapStyle(newProps.style),
    });
  }
  return Object.defineProperties({}, descriptors) as Props;
};

const valueDescriptor = (value: unknown): PropertyDescriptor => ({
  value,
  enumerable: true,
  configurable: true,
  writable: true,
});

const hasGetter = (object: object): boolean => {
  for (const key of Object.getOwnPropertyNames(object)) {
    if (!("value" in Object.getOwnPropertyDescriptor(object, key)!)) return true;
  }
  return false;
};

/** static: no theme, no memo; one class per component, a children-only fast path for a tag */
const createStaticComponent = (
  tag: string | undefined,
  renderTarget: TargetRenderer,
  processor: StaticStyleProcessor,
  skip: (key: PropertyKey) => boolean,
  attrString: string,
): AnyComponent<Props> => {
  const collected = new Classes();
  // a static processor ignores its props argument, it only adds class names
  processor(undefined, collected);
  const staticClass = collected.value || undefined;
  const classOf = (props: Props): string | undefined => {
    const userClass = normalizeClass(props.class);
    if (!userClass) return staticClass;
    // the collector skips generated names the author's class already holds,
    // and an atom may remove one
    const classes = new Classes(userClass);
    processor(props, classes);
    return classes.value || undefined;
  };
  const renderChildrenOnly =
    tag && !VOID_ELEMENTS.test(tag)
      ? createChildrenOnlyRenderer(tag, staticClass, attrString)
      : undefined;
  const meta: RenderMeta = {
    skip,
    compute: undefined,
    classOf,
    attrsAddKeys: false,
    unescapedClass: collected.generated ? staticClass : undefined,
  };
  return (props) => {
    // no props or only children: no skip walk, no props copy, no spread.
    // a reactive spread can add props later and needs the full client binding;
    // on the server props are read once so the proxy check does not matter
    if (renderChildrenOnly && (isServer || !($PROXY in props))) {
      const keys = Object.keys(props);
      if (!keys.length || (keys.length === 1 && keys[0] === "children")) {
        return renderChildrenOnly(props, keys.length !== 0);
      }
    }
    return renderTarget(props, meta);
  };
};

/** tag and class cached per component; only the children need a binding or serialization */
const createChildrenOnlyRenderer = (
  tag: string,
  className: string | undefined,
  attrString: string,
): ((props: Props, hasChildren: boolean) => JSX.Element) => {
  if (isServer) {
    const head = `<${tag}${attrString}`;
    const open = `${className ? ` class="${ssrClassName(className)}"` : ""}>`;
    const closing = `</${tag}>`;
    const parts = [head, open, closing];
    // as in childContent: script and style content is not escaped
    const raw = tag === "script" || tag === "style";
    return (props, hasChildren): { t: string } => {
      // the key comes before the child getter runs, it may render
      const hk = ssrHydrationKey();
      const children = hasChildren ? (raw ? props.children : escape(props.children)) : undefined;
      // text joins in place; anything else goes through ssr() like a compiled
      // template's hole, which handles async children and text separators
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

/** dynamic: the provider theme plus one memo per element for attrs, class and style */
const createDynamicComponent =
  (
    renderTarget: TargetRenderer,
    attrsFn: RuntimeAttrsFn | undefined,
    processor: StyleProcessor,
    skip: (key: PropertyKey) => boolean,
    baked: boolean,
  ): AnyComponent<Props> =>
  (props) => {
    const theme = useTheme();
    // style callbacks see an explicit theme prop before the provider theme
    const propsWithTheme = withTheme(props, theme);
    // attrs and styles run in one memo on purpose
    // a style-only prop change also reruns attrs, still cheaper than
    // two memos per element
    const compute = () => computeStyles(props, propsWithTheme, attrsFn, processor);
    // the server has no updates, so a run-once closure replaces the memo:
    // solid's server memo builds an owner and a computation record per element.
    // on the client the memo is transparent: it claims no hydration id
    const computed = isServer ? once(compute) : createMemo(compute, { transparent: true });
    // theme reaches the target only when attrs set their own; the provider
    // accessor must not land on the dom element. identity, not `in`: an attrs
    // function that spreads its input hands the provider accessor back
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
      // baked attrs sit in the template and cannot add keys, the copy path serves them
      attrsAddKeys: !!attrsFn && !baked,
      unescapedClass: undefined,
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
  // no props check for theme here: when props has one, Reflect.has says so anyway
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

/**
 * the provider theme when props has none. a props proxy (a reactive spread)
 * can gain or lose its theme key later, so it always gets the view; a plain
 * object with a theme is used as is
 */
const withTheme = (props: Props, theme: Accessor<YakTheme>): Props =>
  (!($PROXY in props) && "theme" in props
    ? props
    : new Proxy({ props, theme }, viewTraps)) as Props;

/** style interpolations read attrs over author props, getters only on demand */
const withAttrs = (props: Props, attrs: Props): Props =>
  new Proxy({ props, attrs }, viewTraps) as Props;

/** server stand-in for createMemo: run once, no owner or computation record */
const once = <T extends object>(fn: () => T): (() => T) => {
  let value: T | undefined;
  return () => (value ??= fn());
};

/** string styles become objects before css variables are added */
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

/** the target's render path, chosen once per styled component */
const createTargetRenderer = (
  target: AnyComponent<any> | string,
  attrString: string,
): TargetRenderer => {
  if (typeof target !== "string") {
    return (props, meta) => createComponent(target, targetProps(props, meta));
  }
  if (isServer) {
    const head = `<${target}${attrString}`;
    const closing = VOID_ELEMENTS.test(target) ? undefined : `</${target}>`;
    return (props, meta) => serializeElement(target, head, closing, props, meta);
  }
  return createElementRenderer(target, attrString);
};

/**
 * the server writer: writes the html string by hand instead of using ssrElement.
 * ssrElement needs a filtered props object with getters to keep the
 * read order, that costs more than writing directly
 */
const serializeElement = (
  tag: string,
  head: string,
  closing: string | undefined,
  props: Props,
  meta: RenderMeta,
): { t: string } => {
  // the key comes before any prop read: a getter may render a child and take keys
  const hk = ssrHydrationKey();
  // one memo read for class, style and attrs. branch on the meta field, not
  // on computed: an optional call here costs 20-30 ns on the static writer
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
  let result = head + hk;
  let children: unknown;
  // a textarea's value is its content, like solid's ssrElement writes it
  const textarea = tag === "textarea";
  // author keys first, an attrs value wins; then the keys only attrs has.
  // two loops on purpose: one loop over both key sets costs more on the
  // attrs path (the push and a second `in` per key).
  // only the first child prop is read, and none on a void tag: a child
  // getter may render and take hydration ids
  for (const key of Object.keys(props)) {
    if (skip(key)) continue;
    const source = attrs && key in attrs ? attrs : props;
    if (!isChildKey(key, textarea)) result += attribute(key, source[key]);
    else if (children === undefined && closing) children = childContent(tag, key, source[key]);
  }
  if (attrs) {
    for (const key of Object.keys(attrs)) {
      if (skip(key) || key in props) continue;
      if (!isChildKey(key, textarea)) result += attribute(key, attrs[key]);
      else if (children === undefined && closing) children = childContent(tag, key, attrs[key]);
    }
  }
  // generated class names need no escaping, an author or attrs class does
  if (className !== undefined) {
    const generated = computed ? computed.generatedClass : className === meta.unescapedClass;
    result += ` class="${generated ? className : ssrClassName(className)}"`;
  }
  if (style !== undefined) result += ` style="${ssrStyle(style as Record<string, string>)}"`;
  // a void tag has no children: the finished string is the node, no ssr() call.
  // the space keeps an unquoted hydration key from swallowing the slash
  if (!closing) return { t: result + " />" };
  // text and finished nodes join in place, as solid's own resolver does.
  // functions, arrays and nodes with pending holes go to ssr(): async wrap,
  // error boundary routing, and the separator marker between adjacent
  // text items so the client can claim two text nodes
  const text = plainContent(children);
  if (text !== undefined) return { t: result + ">" + text + closing };
  return ssr([result + ">", closing], children);
};

/** a prop that becomes the element's content: solid's child properties, and a textarea's value */
const isChildKey = (key: string, textarea: boolean) =>
  ChildProperties.has(key) || (textarea && (key === "value" || key === "defaultValue"));

/**
 * the string a child resolves to without ssr(), else undefined. a server
 * node is { t: html, h?: pending async holes }; one with holes needs ssr()
 */
const plainContent = (node: unknown): string | undefined => {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (node == null || typeof node === "boolean") return "";
  if (typeof node !== "object" || Array.isArray(node)) return undefined;
  const server = node as { t?: unknown; h?: unknown[] };
  if (server.h && server.h.length > 0) return undefined;
  if (typeof server.t === "string") return server.t;
  return undefined;
};

/**
 * one server attribute with its leading space, the value rules of solid's
 * ssrElement; bakeAttributes applies the same rules once at definition
 */
const attribute = (prop: string, value: unknown): string => {
  if (prop === "style") return ` style="${ssrStyle(value as string)}"`;
  // class never reaches here, skip drops it. kept on purpose: re-measure
  // the static writer before removing it (code layout)
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

/** the cached template for a fixed tag; svg and mathml tags parse inside their namespace root */
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

/**
 * bind a fixed client tag without dynamic()'s per-element memo. hydration
 * claims the server node by key; a fresh mount clones the cached template.
 * solid's SVGElements set lacks a, script, style and title, so a fresh
 * mount makes them html elements even inside an <svg>, as solid's own
 * dynamic() does
 */
const createElementRenderer = (tag: string, attrString: string): TargetRenderer => {
  const create = createElementTemplate(tag, attrString);
  return (props, meta) => bindElement(getNextElement(create), props, meta);
};

const bindElement = (el: Element, props: Props, meta: RenderMeta): Element => {
  const bound = targetProps(props, meta);
  // a proxy can add children later, so it keeps the child binding
  const skipChildren = !($PROXY in bound) && !("children" in bound);
  // no untrack here: a component body runs untracked
  spread(el, bound, skipChildren);
  // replay events once the element's bindings are ready
  runHydrationEvents();
  return el;
};

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
const targetProps = (props: Props, meta: RenderMeta): Record<PropertyKey, unknown> => {
  if (!meta.attrsAddKeys && !($PROXY in props)) return copyProps(props, meta);
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
    if (compute) {
      const computed = compute();
      out.class = computed.class;
      if (computed.style !== undefined) out.style = computed.style;
    } else out.class = classOf(props);
    return out;
  }
  const classFn = compute ? () => compute().class : () => classOf(props);
  const styleFn = styleGetter(compute);
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
  // trap closures per element on purpose, not shared with viewTraps: solid's
  // for-in hits two traps per key, and the indirection of a backing object showed
  const { skip, compute, classOf } = meta;
  // meta.attrsAddKeys, not the destructured copy: the read narrows meta.compute
  const attrsProps = () => (meta.attrsAddKeys ? meta.compute().attrs : undefined);
  const classFn = compute ? () => compute().class : () => classOf(props);
  const styleFn = styleGetter(compute);
  const contributed = (key: PropertyKey) =>
    key === "class" ? classFn : key === "style" ? styleFn : undefined;
  const fromAttrs = (key: PropertyKey) => {
    const attrs = attrsProps();
    return attrs && key in attrs ? attrs : undefined;
  };
  return new Proxy(props, {
    get(target, key, receiver) {
      // the receiver, like solid's own props proxies: solid's spread walks
      // a proxy's keys through its traps only when props[$PROXY] === props
      if (key === $PROXY) return receiver;
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
      // class and style are always own keys, listed after the author keys and attrs
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
