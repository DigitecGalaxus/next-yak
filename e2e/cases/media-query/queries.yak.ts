import { breakpoints } from "./screenSizes.ts";

/**
 * Example of a dynamic media query generator
 *
 * Proably not something you'd do in a real app, but it serves as a good test case for dynamic values in media queries
 */
const screenQueries = {} as Record<keyof typeof breakpoints, string>;

for (const [name, { min, max }] of Object.entries(breakpoints) as [
  keyof typeof breakpoints,
  { min: number; max: number },
][]) {
  const parts: string[] = [];
  if (min) parts.push(`(min-width: ${min}px)`);
  if (max) parts.push(`(max-width: ${max}px)`);
  screenQueries[name] = `@media ${parts.join(" and ")}`;
}

export { screenQueries };
