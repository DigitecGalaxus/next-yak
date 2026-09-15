// the compiler extracts the css at build time; this file only builds class
// and style per element. the map, for a reader who lands in the middle:
//
// styled() flattens a chain of styled components and picks one of two
// component shapes at definition. static: the class is fixed, there is no
// attrs function and the css block writes no style values at render time,
// so no theme read. dynamic: attrs, class and style are computed per render.
//
// every styled component is a plain function, not a component$: qwik inlines
// it into the parent's render (no lazy boundary, no serialized props, no
// <Slot>), so children arrive as a prop and a signal read inside it is
// tracked by the parent. both shapes end in jsx(target, props); qwik prints
// the tag on the server and binds it on the client.
//
// words: author = the app code that writes the css block, renders the
// component and passes props; target = the tag or component under the
// styled layer; attrs = the .attrs() values, an object or a function of
// props; collector = the Classes instance a css block adds its names to;
// atom = a class name the author passes into a css block via atoms("...")
import { isSignal } from "@qwik.dev/core";
import { jsx } from "@qwik.dev/core/jsx-runtime";
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
import { mergeClasses, normalizeClass } from "./internals/mergeClasses.js";
// the runtime and the app share one theme context; vite can alias this export
import { readTheme } from "@yak/qwik/context";
import type { YakTheme } from "./context/index.js";

/** the props a styled component receives from its author */
type Props = {
  class?: unknown;
  style?: StyleObject | string;
  theme?: YakTheme;
  children?: unknown;
} & Record<string, unknown>;

/**
 * the compiled css block: adds its class names to the collector and, when
 * $dynamic, style values for the props; the css itself is extracted at build time
 */
type StyleProcessor = CompiledStyleProcessor<unknown>;

type RuntimeAttrsFn = (props: Props) => Props;

/** the .attrs() values: an object, or a function of the author's props */
type RuntimeAttrs = Props | RuntimeAttrsFn;

/** what a styled component built on another yak component inherits from it */
type ComponentMetadata = readonly [
  attrs: RuntimeAttrs | undefined,
  styles: StyleProcessor,
  target: AnyComponent<any> | string,
];

/** the loosely typed form of Styled that yakStyled implements; the public overloads live in publicStyledApi */
export type StyledInternal = <
  T extends object,
  TAttrsIn extends object = {},
  TAttrsOut extends AttrsMerged<T, TAttrsIn> = AttrsMerged<T, TAttrsIn>,
>(
  Component: AnyComponent<T> | YakComponent<T> | HtmlTags | string,
  attrs?: Attrs<T, TAttrsIn, TAttrsOut>,
) => StyledLiteral<Substitute<T, TAttrsIn>>;

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
  const isYakComponent =
    typeof Component === "function" &&
    (Component as Partial<YakComponent<unknown>>)[yakComponentSymbol] !== undefined;
  // the public tuple type hides the shape, one cast at the read
  const [parentAttrs, parentStyles, parentTarget] = isYakComponent
    ? ((Component as YakComponent<unknown>)[yakComponentSymbol] as ComponentMetadata)
    : [];

  // the chain renders its final target once, with all attrs and style processors combined
  const target = (parentTarget ?? Component) as AnyComponent<any> | string;
  const mergedAttrs = composeAttrs(attrs as RuntimeAttrs | undefined, parentAttrs);

  return (styles, ...values) => {
    // the interpolations of the style block, e.g.
    //   styled.button`color: ${props => props.color}; margin: ${props => props.margin};`
    // arrive compiled: styles and values hold class names, style callbacks
    // and css-variable maps, no css text
    const processor = composeStyles(css(styles, ...values), parentStyles);
    const attrsFn = typeof mergedAttrs === "function" ? mergedAttrs : undefined;
    const attrsObject = typeof mergedAttrs === "function" ? undefined : mergedAttrs;
    // static: no attrs function, and the css block writes no style values
    const isStatic = !attrsFn && !processor.$dynamic;
    // the target never sees $-props, the author class (yak hands it the
    // merged one) or the theme; a dynamic component merges style too. an
    // attrs object wins over the author's prop of the same name, even when
    // its value is null
    const skip = (key: string) =>
      key.charCodeAt(0) === 36 /* $ */ ||
      key === "class" ||
      key === "theme" ||
      (!isStatic && key === "style") ||
      (attrsObject !== undefined && Object.hasOwn(attrsObject, key));
    const Yak = isStatic
      ? createStaticComponent(target, processor as StaticStyleProcessor, skip, attrsObject)
      : createDynamicComponent(target, processor, skip, attrsFn, attrsObject);
    const metadata: ComponentMetadata = [mergedAttrs, processor, target];
    return Object.assign(Yak, { [yakComponentSymbol]: metadata });
  };
};

/** parent attrs first, then own attrs read and override that result */
const composeAttrs = (attrs?: RuntimeAttrs, parent?: RuntimeAttrs): RuntimeAttrs | undefined => {
  if (!attrs) return parent;
  if (!parent) return attrs;
  // two objects combine once here and stay an object
  if (typeof attrs !== "function" && typeof parent !== "function") {
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
  return Object.assign(
    (props: unknown, classes: Classes, style: StyleObject) => {
      parent(props, classes, style);
      own(props, classes, style);
    },
    { $dynamic: own.$dynamic || parent.$dynamic },
  ) as StyleProcessor;
};

/**
 * attrs override props; class and style values combine, e.g.
 *   { class: "a", foo: 1 } and { class: "b", bar: 2 }  ->  { class: "a b", foo: 1, bar: 2 }
 */
const combineProps = (props: Props, newProps: Props | null | undefined): Props => {
  if (!newProps) return props;
  const out: Props = { ...props, ...newProps };
  // an equal class counts as nothing: own attrs get the combined props and
  // may hand the same class back, merging it again would duplicate it
  if (newProps.class && props.class !== newProps.class) {
    out.class = mergeClasses(normalizeClass(props.class), newProps.class);
  }
  if (newProps.style && props.style !== newProps.style) {
    out.style = { ...unwrapStyle(props.style), ...unwrapStyle(newProps.style) };
  }
  return out;
};

/** static: no theme; one class per component, a children-only fast path */
const createStaticComponent = (
  target: AnyComponent<any> | string,
  processor: StaticStyleProcessor,
  skip: (key: string) => boolean,
  attrs: Props | undefined,
): AnyComponent<Props> => {
  const collected = new Classes(normalizeClass(attrs?.class));
  // a static processor ignores its props argument, it only adds class names
  processor(undefined, collected);
  const staticClass = collected.value || undefined;
  const attrsStyle = attrs ? unwrapStyle(attrs.style) : undefined;
  // the attrs object without the keys yak merges, spread into every render
  const fixed: Props = {};
  if (attrs) {
    for (const key of Object.keys(attrs)) {
      if (key !== "class" && key !== "style") fixed[key] = attrs[key];
    }
  }
  const classOf = (userClass: unknown): string | undefined => {
    const user = normalizeClass(userClass);
    if (!user) return staticClass;
    // the collector skips generated names the author's class already holds,
    // and an atom may remove one
    const classes = new Classes(mergeClasses(user, attrs?.class));
    processor(undefined, classes);
    return classes.value || undefined;
  };
  return (props) => {
    const keys = Object.keys(props);
    // no props or only children: no skip walk, no copy
    if (!keys.length || (keys.length === 1 && keys[0] === "children")) {
      const out: Props = { ...fixed, children: props.children };
      if (staticClass !== undefined) out.class = staticClass;
      if (attrsStyle !== undefined) out.style = attrsStyle;
      return jsx(target as string, out);
    }
    const out: Props = { ...fixed };
    for (const key of keys) {
      if (!skip(key)) out[key] = props[key];
    }
    const className = classOf(props.class);
    if (className !== undefined) out.class = className;
    if (attrsStyle !== undefined) {
      out.style = props.style ? { ...attrsStyle, ...unwrapStyle(props.style) } : attrsStyle;
    }
    return jsx(target as string, out);
  };
};

/** dynamic: the theme plus attrs, class and style computed per render */
const createDynamicComponent = (
  target: AnyComponent<any> | string,
  processor: StyleProcessor,
  skip: (key: string) => boolean,
  attrsFn: RuntimeAttrsFn | undefined,
  attrsObject: Props | undefined,
): AnyComponent<Props> => {
  return (props) => {
    // style callbacks see an explicit theme prop before the provider theme
    const theme = "theme" in props ? (props.theme as YakTheme) : readTheme();
    // one copy of the author's props: reading them here is what the parent
    // render tracks; the copy gives the theme and the attrs to the callbacks
    const view: Props = { ...props, theme };
    const attrs = attrsFn ? attrsFn(view) : attrsObject;
    const withAttrs = attrs ? { ...view, ...attrs } : view;
    const classes = new Classes(mergeClasses(normalizeClass(props.class), attrs?.class));
    const style: StyleObject = { ...unwrapStyle(props.style), ...unwrapStyle(attrs?.style) };
    processor(withAttrs, classes, style);
    const out: Props = {};
    for (const key of Object.keys(props)) {
      if (!skip(key)) out[key] = props[key];
    }
    if (attrs) {
      for (const key of Object.keys(attrs)) {
        // attrs win over the author's props; class and style were merged
        // above and $-props stay with yak
        if (key === "class" || key === "style" || key.charCodeAt(0) === 36 /* $ */) continue;
        // theme reaches the target only when attrs set their own; identity,
        // not `in`: an attrs function that spreads its input hands the
        // provider theme back
        if (key === "theme" && attrs.theme === theme) continue;
        out[key] = attrs[key];
      }
    }
    if (classes.value) out.class = classes.value;
    if (hasKeys(style)) out.style = style;
    return jsx(target as string, out);
  };
};

/** string styles become objects before css variables are added */
const unwrapStyle = (style: unknown): StyleObject | undefined => {
  if (isSignal(style)) style = style.value;
  if (typeof style !== "string") {
    return style as StyleObject | undefined;
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

/** no array for a yes/no answer */
const hasKeys = (object: object): boolean => {
  for (const _ in object) return true;
  return false;
};
