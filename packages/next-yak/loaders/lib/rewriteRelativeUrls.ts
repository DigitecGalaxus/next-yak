import path from "node:path";

/**
 * Rewrites a single relative url path when inlining CSS from a different
 * source file. Adjusts the path so it resolves correctly from the consumer's
 * directory instead of the source's directory.
 *
 * e.g. `"./images/sun.avif"` in `/src/icons/styles.ts` becomes
 * `"../icons/images/sun.avif"` when inlined into `/src/pages/home.ts`
 */
export function rewriteRelativeCSSUrl(
  urlPath: string,
  source: string,
  consumer: string,
): string {
  // Use platform-aware path to correctly handle both \ and / separators
  const relPrefix = path.relative(path.dirname(consumer), path.dirname(source));
  // Normalize to POSIX for CSS url() output (on Windows, relative returns \)
  return path.posix.normalize(relPrefix.replace(/\\/g, "/") + "/" + urlPath);
}
