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
  relevantProps: Record<string, unknown>,
  cssProp: (
    props: unknown,
    classNames: Set<string>,
    style: Record<string, string>,
  ) => void,
) => {
  const classNames = new Set<string>(
    (relevantProps.className as string | undefined)?.split(" "),
  );
  const style = (relevantProps.style as Record<string, string>) ?? {};
  cssProp({}, classNames, style);

  const result: { className?: string; style?: Record<string, string> } = {};

  if (Object.keys(style).length > 0) {
    result.style = style;
  }

  if (classNames.size > 0) {
    result.className = [...classNames].join(" ");
  }

  return result;
};
