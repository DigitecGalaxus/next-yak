/**
 * Normalize Solid `class` values for string merging.
 * Solid 2 allows strings, arrays and object syntax on the class attribute.
 */
export const normalizeClass = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(normalizeClass).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return Object.keys(value)
      .filter((key) => (value as Record<string, unknown>)[key])
      .join(" ");
  }
  return String(value);
};

/**
 * Merges the folded yak class name with a user `class` value.
 *
 * Injected by the compiler (as `__yak_mergeClassNames`) when it replaces a JSX
 * usage of a fully static styled component with a plain element:
 * ```tsx
 * const Card = styled.div`color: red;`;
 * <Card class={active() && "active"} />
 * ```
 * becomes
 * ```tsx
 * <div class={__yak_mergeClassNames("yX", active() && "active")} />
 * ```
 */
export const mergeClasses = (yakClass: string, userClass: unknown): string | undefined => {
  const user = normalizeClass(userClass);
  if (!yakClass) return user || undefined;
  if (!user) return yakClass;
  return yakClass + " " + user;
};
