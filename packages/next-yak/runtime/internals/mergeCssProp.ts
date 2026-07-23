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
  cssProp: RuntimeStyleProcessor<unknown>,
) => {
  const classNames = new ClassNames(relevantProps.className);

  const existingStyle = relevantProps.style;
  const style = existingStyle ? { ...existingStyle } : {};

  cssProp({}, classNames, style);

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
