import { posix, win32 } from "node:path";

/**
 * A mixin keeps the relative url() paths of the file that defines it. When the
 * cross-file resolver inlines the mixin into a file in another directory, the
 * bundler resolves those paths from the new file, so they have to change:
 *
 *   // src/icons/mixins.ts
 *   export const sun = css`background: url("./sun.avif");`;
 *   // src/pages/home.tsx
 *   const Hero = styled.div`${sun}`;
 *   -> background: url("../icons/sun.avif");
 *
 * Only paths that start with "./" or "../" change. "/sun.avif", "data:" and
 * "https:" urls point to the same place from every file.
 */
export function rewriteRelativeCssUrls(css: string, source: string, consumer: string): string {
  if (!css.includes("url(")) return css;
  // Windows paths arrive as "C:\app\a.tsx" from webpack and as "C:/app/a.tsx" from
  // Vite. win32 reads both, and choosing it by the path keeps the result the same on
  // every OS, which lets the unit tests cover Windows paths.
  const path = /^[a-z]:[\\/]/i.test(consumer) ? win32 : posix;
  // A query on the mixin import, as in `import { sun } from "./mixins.ts?v=2"`, is not part of the path
  const prefix = path.relative(path.dirname(consumer), path.dirname(source.split("?")[0]));
  // Two Windows drives have no relative path between them, so relative() returns
  // the absolute directory of the source and the urls stay as they are
  if (path.isAbsolute(prefix)) return css;

  return css.replace(cssUrlRegex, (match, double?: string, single?: string, bare?: string) => {
    const url = double ?? single ?? bare ?? "";
    if (!url.startsWith("./") && !url.startsWith("../")) return match;
    const quote = double !== undefined ? '"' : single !== undefined ? "'" : "";
    // "../icons" + "./sun.avif" -> "../icons/sun.avif", "img" + "./a.png" -> "./img/a.png"
    const rewritten = path.join(prefix, url).replace(/\\/g, "/");
    return `url(${quote}${rewritten.startsWith("../") ? "" : "./"}${rewritten}${quote})`;
  });
}

/**
 * url("a.png"), url('a.png') or url(a.png), with optional spaces inside the parentheses.
 * The url has no "*": without that, a match could start in a comment and run into the
 * next rule, so `/* url("./ *\/ .a:before { content: ")" }` would rewrite the rule.
 */
const cssUrlRegex = /url\(\s*(?:"([^"*]*)"|'([^'*]*)'|([^'"()\s*]*))\s*\)/g;
