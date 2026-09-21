import { ClassNames } from "../cssLiteral.js";
import { RuntimeStyleProcessor } from "../publicStyledApi.js";

/**
 * This is an internal helper function to merge relevant props of a native element with a css prop.
 * It's automatically added when using the `css` prop in a JSX element.
 * e.g.:
 * ```tsx
 * <p
 *  className="foo"
 *  css={css`
 *   color: green;
 * `}
 *  {...{ style: { padding: "30px" }}}
 * />
 * ```
 * compiles to
 * ```tsx
 * <p {...__yak_mergeCssProp(css("yakCss1"), { className: "foo" }, { style: { padding: "30px" } })} />
 * ```
 * The css value comes first, then every merged source in JSX order, so a
 * later source wins as it would in one object literal.
 */
export const mergeCssProp = (
  cssProp: RuntimeStyleProcessor<unknown> | false | null | undefined,
  ...sources: (Record<string, unknown> | null | undefined)[]
) => {
  // React props are plain values, so the sources are merged up front
  const result: Record<string, unknown> & {
    className?: string;
    style?: Record<string, string>;
  } = Object.assign({}, ...sources);

  const classNames = new ClassNames(result.className);
  const existingStyle = result.style;
  const style = existingStyle ? { ...existingStyle } : {};

  // only a style function applies styles. A falsy css prop applies none,
  // e.g. `css={on && css`...`}` with `on` false
  if (typeof cssProp === "function") {
    cssProp({}, classNames, style);
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

  // Forward all other props (onClick, aria-*, id, …) untouched and only
  // override className/style with the merged result
  if (Object.keys(style).length > 0) {
    result.style = style;
  } else {
    delete result.style;
  }
  if (classNames.value) {
    result.className = classNames.value;
  } else {
    delete result.className;
  }

  return result;
};
