import { isSignal } from "@qwik.dev/core";

/**
 * Normalize a Qwik `class` value to one string. Qwik allows strings, arrays,
 * objects and a Signal on the class attribute; a Signal is read here, so the
 * enclosing render tracks it and re-runs on change.
 */
export const normalizeClass = (value: unknown): string => {
  if (isSignal(value)) value = value.value;
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
 * <Card class={active.value && "active"} />
 * ```
 * becomes
 * ```tsx
 * <div class={__yak_mergeClassNames("yX", active.value && "active")} />
 * ```
 * styled.ts uses it for the attrs class as well.
 */
export const mergeClasses = (yakClass: string, userClass: unknown): string | undefined => {
  const user = normalizeClass(userClass);
  if (!yakClass) return user || undefined;
  if (!user) return yakClass;
  return yakClass + " " + user;
};
