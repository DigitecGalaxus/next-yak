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

/**
 * Allows next-yak's co-located `*.yak.css` files to be imported from any
 * module, not only the Next.js Custom `<App>`.
 *
 * Yak's hashed, component-local selectors make Next.js's global-CSS
 * import restriction unnecessary. This function:
 * 1. Excludes `*.yak.css` from Next.js's error-loader and restricted
 *    global-CSS rules so exactly one rule matches it.
 * 2. On the client build, appends an unrestricted rule that runs `.yak.css`
 *    through Next.js's own global-CSS loader chain. The server build's
 *    `ignore-loader` already handles it after step 1.
 *
 * Must run before yak's own `.yak.css` rule is appended (loader order).
 *
 * @throws if Next.js's global-CSS error-loader rules cannot be found.
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

  const excludeYakCss = (rule: Rule): void => {
    rule.exclude = rule.exclude === undefined ? yakCssRegExp : [rule.exclude, yakCssRegExp];
  };

  let globalCssChain: LoaderItem[] | undefined;
  let neutralisedAnErrorRule = false;

  const visit = (ruleList: unknown): void => {
    if (!Array.isArray(ruleList)) return;
    for (const rule of ruleList) {
      if (!isRule(rule)) continue;
      visit(rule.oneOf);
      visit(rule.rules);

      if (hasErrorLoader(rule.use)) {
        excludeYakCss(rule);
        neutralisedAnErrorRule = true;
        continue;
      }

      // Capture the global-CSS loader chain for reuse, then exclude .yak.css
      // so the unrestricted rule appended below is the only match.
      if (
        rule.test instanceof RegExp &&
        rule.test.source === nextGlobalCssRegExpSource &&
        isGlobalCssLoaderChain(rule.use)
      ) {
        globalCssChain ??= rule.use;
        excludeYakCss(rule);
      }
    }
  };

  visit(rules);

  if (!neutralisedAnErrorRule) {
    throw new Error(
      "next-yak: could not find Next.js's global-CSS error-loader rules while " +
        'setting up `transpilationMode: "Css"`. Next.js\'s CSS pipeline has ' +
        "changed shape — next-yak's withYak needs to be updated to match it.",
    );
  }

  // Only populated on client builds; server builds need no extra rule.
  if (globalCssChain) {
    rules.push({
      test: yakCssRegExp,
      sideEffects: true,
      use: [...globalCssChain],
    });
  }
}
