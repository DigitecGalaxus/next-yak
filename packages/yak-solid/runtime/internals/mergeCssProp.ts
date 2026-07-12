import { ClassNames } from "../cssLiteral.js";
import { RuntimeStyleProcessor } from "../publicStyledApi.js";

/**
 * This is an internal helper function to merge relevant props of a native element with a css prop.
 * It's automatically added when using the `css` prop in a JSX element.
 * e.g.:
 * ```tsx
 * <p
 *  class="foo"
 *  css={css`
 *   color: green;
 * `}
 * {...{ style: { padding: "30px" }}}
 * />
 */
export const mergeCssProp = (
  relevantProps: {
    class?: string;
    style?: Record<string, string>;
  } & Record<string, unknown>,
  cssProp: RuntimeStyleProcessor<unknown>,
) => {
  const classNames = new ClassNames(relevantProps.class);

  const existingStyle = relevantProps.style;
  const style = existingStyle ? { ...existingStyle } : {};

  cssProp({}, classNames, style);

  const result: { class?: string; style?: Record<string, string> } = {};

  if (Object.keys(style).length > 0) {
    result.style = style;
  }
  if (classNames.value) {
    result.class = classNames.value;
  }

  return result;
};
