import { Classes } from "../cssLiteral.js";
import { RuntimeStyleProcessor, StyleObject } from "../publicStyledApi.js";
import { normalizeClass } from "./mergeClasses.js";

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
 * The css value comes first, then every merged source in JSX order, so a
 * later source wins as it would in one object literal. Qwik props are plain
 * values inside a render, so the sources merge up front (as on React).
 */
export const mergeCssProp = (
  cssProp: RuntimeStyleProcessor<unknown> | false | null | undefined,
  ...sources: (Record<string, unknown> | null | undefined)[]
) => {
  const result: Record<string, unknown> & { class?: unknown; style?: StyleObject | string } =
    Object.assign({}, ...sources);

  const classes = new Classes(normalizeClass(result.class));
  const existingStyle = result.style;
  const style: StyleObject =
    typeof existingStyle === "object" && existingStyle ? { ...existingStyle } : {};

  // only a style function applies styles. A falsy css prop applies none,
  // e.g. `css={on && css`...`}` with `on` false
  if (typeof cssProp === "function") {
    cssProp({}, classes, style);
  } else if (cssProp) {
    // The swc plugin rejects a value which can not apply styles at build time,
    // so this only runs where it can not see one during build time.
    if (process.env.NODE_ENV === "development") {
      const received: unknown = cssProp;
      throw new Error(
        `The css prop only applies styles written in place, but received ${
          Array.isArray(received) ? "an array" : `a value of type ${typeof received}`
        }.\n\nCombine several styles in one template instead of an array: css={css\`\${first} \${second}\`}\nWrite declarations in a template instead of an object: css={css\`color: red;\`}`,
      );
    }
  }

  // forward every other prop untouched; a string style with no css values
  // to add stays as it was
  if (Object.keys(style).length > 0) {
    result.style = style;
  } else if (typeof existingStyle !== "string") {
    delete result.style;
  }
  if (classes.value) {
    result.class = classes.value;
  } else {
    delete result.class;
  }
  return result;
};
