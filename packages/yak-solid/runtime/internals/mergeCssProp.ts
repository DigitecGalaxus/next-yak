import { isServer } from "@solidjs/web";
import { Classes } from "../cssLiteral.js";
import { RuntimeStyleProcessor, StyleObject } from "../publicStyledApi.js";
import { normalizeClass } from "./mergeClasses.js";

type Source = Record<PropertyKey, unknown>;

/** the last source that carries the key */
const lastWith = (sources: Source[], key: string): Source | undefined => {
  for (let index = sources.length - 1; index >= 0; index--) {
    if (key in sources[index]) return sources[index];
  }
  return undefined;
};

/**
 * Merges the relevant props of a native element with a css prop. The
 * compiler adds it for the `css` prop:
 * ```tsx
 * <button class="a" {...props} style={s} css={css`color: green;`} />
 * ```
 * compiles to
 * ```tsx
 * <button {...__yak_mergeCssProp(css("yak1"), { class: "a" }, props, { style: s })} />
 * ```
 * Nothing is read while this runs. Spreading the sources into one object would
 * invoke their getters, and the Solid compiler evaluates this call before
 * `ssrElement` takes the hydration key on the server but inside the spread's
 * callback after the element is claimed on the client: a `children` getter
 * read here would take its hydration id on one side only and the element would
 * never hydrate. So the descriptors are copied untouched, and `class` and
 * `style` are resolved by whoever reads them.
 */
export const mergeCssProp = (
  cssProp: RuntimeStyleProcessor<unknown> | false | null | undefined,
  ...sources: (Source | null | undefined)[]
) => {
  const present = sources.filter((source): source is Source => source != null);
  const out: Source = {};
  for (const source of present) {
    for (const key of Reflect.ownKeys(source)) {
      // contributed below, from the last source that carries them
      if (key === "class" || key === "style") continue;
      const descriptor = Reflect.getOwnPropertyDescriptor(source, key)!;
      if (descriptor.get || descriptor.set || !descriptor.enumerable) {
        Object.defineProperty(out, key, descriptor);
      } else {
        out[key] = descriptor.value;
      }
    }
  }
  // `in` finds the owner without invoking its getter
  const classOwner = lastWith(present, "class");
  const styleOwner = lastWith(present, "style");

  const mergedClass = (): string | undefined => {
    const classes = new Classes(normalizeClass(classOwner?.class));
    // a falsy css prop applies no styles, e.g. `css={on && css`...`}` with `on` false
    if (cssProp) cssProp({}, classes, {} as StyleObject);
    return classes.value || undefined;
  };
  const mergedStyle = (): StyleObject | undefined => {
    const base = styleOwner?.style as StyleObject | undefined;
    const style: StyleObject = base ? { ...base } : {};
    if (cssProp) cssProp({}, new Classes(), style);
    for (const _ in style) return style;
    return undefined;
  };

  if (isServer) {
    // The server reads once, so the values are resolved here; a class or
    // style read takes no hydration id. A key left undefined would make
    // `ssrElement` write `class=""`, so only carried values are set.
    const className = mergedClass();
    if (className !== undefined) out.class = className;
    const style = mergedStyle();
    if (style !== undefined) out.style = style;
    return out;
  }
  // on the client the spread reads these inside its effect, so a signal read
  // by a source or by the css prop updates the attribute in place
  if (cssProp || classOwner) {
    Object.defineProperty(out, "class", { get: mergedClass, enumerable: true, configurable: true });
  }
  if (cssProp || styleOwner) {
    Object.defineProperty(out, "style", { get: mergedStyle, enumerable: true, configurable: true });
  }
  return out;
};
