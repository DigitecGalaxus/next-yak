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
  const classNames = new Set<string>();
  const style = {};
  cssProp({}, classNames, style);
  return {
    className: relevantProps.className
      ? relevantProps.className + " " + [...classNames].join(" ")
      : [...classNames].join(" "),
    style: { ...(relevantProps.style ?? {}), ...style },
  };
};
