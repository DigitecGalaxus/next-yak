/**
 * Merges two optional class name values with a space.
 *
 * Used by the styled runtime to combine incoming and generated class names,
 * and injected by the compiler (as `__yak_mergeClassNames`) when it replaces
 * a JSX usage of a fully static styled component with a plain DOM element:
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
  a: string | false | null | undefined,
  b: string | false | null | undefined,
) => {
  if (!a) return b || undefined;
  if (!b) return a;
  return a + " " + b;
};
