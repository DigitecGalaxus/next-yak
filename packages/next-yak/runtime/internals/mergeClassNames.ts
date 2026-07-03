/**
 * This is an internal helper function to merge the static class name of a
 * folded styled component with a dynamic className expression.
 * It's automatically added when the compiler replaces a JSX usage of a fully
 * static styled component with a plain DOM element.
 * e.g.:
 * ```tsx
 * const Card = styled.div`color: red;`;
 * <Card className={active && "active"} />
 * ```
 * becomes
 * ```tsx
 * <div className={__yak_mergeClassNames("yX", active && "active")} />
 * ```
 */
export const mergeClassNames = (
  yakClassName: string,
  className: string | false | null | undefined,
) => (className ? yakClassName + " " + className : yakClassName);
