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
 * {...{ style: { padding: "30px" }}}
 * />
 */
export const mergeCssProp = (
  relevantProps: {
    className?: string;
    style?: Record<string, string>;
  } & Record<string, unknown>,
  cssProp: RuntimeStyleProcessor<unknown> | false | null | undefined,
) => {
  const classNames = new ClassNames(relevantProps.className);

  const existingStyle = relevantProps.style;
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
  // override className/style with the merged result — the transform already
  // built `relevantProps` in JSX attribute order, so this preserves overrides.
  const result: Record<string, unknown> & {
    className?: string;
    style?: Record<string, string>;
  } = { ...relevantProps };

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
