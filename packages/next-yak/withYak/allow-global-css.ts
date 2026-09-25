import { existsSync } from "node:fs";
import path from "node:path";

interface WebpackConfig {
  module?: { rules?: unknown[] };
}

type LoaderItem = string | { loader?: string; options?: Record<string, unknown> };

interface Rule {
  test?: unknown;
  use?: LoaderItem | LoaderItem[];
  exclude?: unknown;
  oneOf?: unknown;
  rules?: unknown;
}

export function hasAppDir(projectDir: string): boolean {
  return (
    // mirrors next.js's `findDir(dir, "app")`
    existsSync(path.join(projectDir, "app")) || existsSync(path.join(projectDir, "src", "app"))
  );
}

/**
 * Allows next-yak's co-located `*.yak.css` files to be imported from any
 * module in a pages-only project, not only the Next.js Custom `<App>`.
 *
 * Yak's hashed, component-local selectors make Next.js's global-CSS
 * import restriction unnecessary. This function:
 * 1. Excludes `*.yak.css` from Next.js's error-loader and restricted
 *    global-CSS rules so exactly one rule matches it.
 * 2. Appends an unrestricted rule that runs `.yak.css` through Next.js's
 *    own global-CSS loader chain.
 *
 * Must run before yak's own `.yak.css` rule is appended (loader order).
 */
export function allowYakGlobalCss(webpackConfig: WebpackConfig) {
  const rules = webpackConfig.module?.rules;
  if (!Array.isArray(rules)) {
    return;
  }

  // Matches yak's emitted sibling CSS files.
  const yakCssRegExp = /\.yak\.css$/;
  // Next.js's internal `regexCssGlobal` source — identifies global-CSS rules.
  const nextGlobalCssRegExpSource = "(?<!\\.module)\\.css$";

  const isRule = (value: unknown): value is Rule =>
    typeof value === "object" && value !== null && !Array.isArray(value);

  const hasErrorLoader = (use: Rule["use"]): boolean => {
    if (use === undefined) return false;
    const items = Array.isArray(use) ? use : [use];
    return items.some(
      (item) =>
        item === "error-loader" || (typeof item === "object" && item?.loader === "error-loader"),
    );
  };

  // Identifies Next.js's global-CSS loader chain (css-loader with modules: false).
  const isGlobalCssLoaderChain = (use: Rule["use"]): use is LoaderItem[] =>
    Array.isArray(use) &&
    use.some(
      (item) =>
        typeof item === "object" &&
        typeof item?.loader === "string" &&
        item.loader.includes("css-loader") &&
        item?.options?.["modules"] === false,
    );

  // Collect first and mutate later, so a partial match changes nothing.
  const errorRules: Rule[] = [];
  const globalCssRules: Rule[] = [];
  let globalCssChain: LoaderItem[] | undefined;

  const visit = (ruleList: unknown): void => {
    if (!Array.isArray(ruleList)) return;
    for (const rule of ruleList) {
      if (!isRule(rule)) continue;
      visit(rule.oneOf);
      visit(rule.rules);

      if (hasErrorLoader(rule.use)) {
        errorRules.push(rule);
        continue;
      }

      if (
        rule.test instanceof RegExp &&
        rule.test.source === nextGlobalCssRegExpSource &&
        isGlobalCssLoaderChain(rule.use)
      ) {
        globalCssChain ??= rule.use;
        globalCssRules.push(rule);
      }
    }
  };

  visit(rules);

  if (errorRules.length === 0 || !globalCssChain) {
    console.warn(
      "next-yak: could not find the next.js global-CSS rules. " +
        "Please report this issue with your Next.js version.",
    );
    return;
  }

  for (const rule of [...errorRules, ...globalCssRules]) {
    rule.exclude = rule.exclude === undefined ? yakCssRegExp : [rule.exclude, yakCssRegExp];
  }

  rules.push({
    test: yakCssRegExp,
    sideEffects: true,
    use: [...globalCssChain],
  });
}
