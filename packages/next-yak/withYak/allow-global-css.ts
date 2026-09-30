import { existsSync } from "node:fs";
import path from "node:path";
import { packageName } from "../packageName.js";

interface WebpackConfig {
  module?: { rules?: unknown[] };
}

interface Rule {
  test?: unknown;
  issuer?: unknown;
  use?: unknown;
  oneOf?: unknown;
  rules?: unknown;
}

export function hasAppDir(projectDir: string): boolean {
  return (
    // mirrors next.js's `findDir(dir, "app")`
    // https://github.com/vercel/next.js/blob/v16.3.4/packages/next/src/lib/find-pages-dir.ts#L4-L13
    existsSync(path.join(projectDir, "app")) || existsSync(path.join(projectDir, "src", "app"))
  );
}

/**
 * Next.js (pages router) only allows global CSS imports from `_app`.
 * Everywhere else it expects CSS Modules. Yak's co-located `*.yak.css`
 * files are plain global CSS, because yak already hashes the class names
 * itself, so there's no risk of leaking styles
 *
 * Next.js has no option to allow this, so we copy its `_app` global CSS
 * rule without the `_app` issuer check and limit the copy to `.yak.css`.
 * The copy goes to the start of the same `oneOf`, so it matches before
 * Next's error rules.
 */
export function allowYakGlobalCss(webpackConfig: WebpackConfig) {
  const rules = webpackConfig.module?.rules;
  if (!Array.isArray(rules)) {
    return;
  }

  // Next.js's internal `regexCssGlobal` source
  // https://github.com/vercel/next.js/blob/v16.3.4/packages/next/src/build/webpack/config/blocks/css/index.ts#L23
  const nextGlobalCssRegExpSource = "(?<!\\.module)\\.css$";

  const isRule = (value: unknown): value is Rule =>
    typeof value === "object" && value !== null && !Array.isArray(value);

  // Next.js sets `issuer: { and: [ctx.customAppFile] }`, where
  // `customAppFile` is a RegExp for the path of `pages/_app`
  // https://github.com/vercel/next.js/blob/v16.3.4/packages/next/src/build/webpack-config.ts#L2550-L2552
  const hasAppIssuer = (rule: Rule): boolean => {
    if (!isRule(rule.issuer)) return false;
    const and = (rule.issuer as { and?: unknown }).and;
    return Array.isArray(and) && and[0] instanceof RegExp && and[0].source.endsWith("_app");
  };

  const isAppGlobalCssRule = (rule: Rule): boolean =>
    rule.test instanceof RegExp &&
    rule.test.source === nextGlobalCssRegExpSource &&
    hasAppIssuer(rule) &&
    Array.isArray(rule.use);

  const findAppRule = (ruleList: unknown): { oneOf: unknown[]; appRule: Rule } | undefined => {
    if (!Array.isArray(ruleList)) return undefined;
    for (const rule of ruleList) {
      if (!isRule(rule)) continue;
      if (Array.isArray(rule.oneOf)) {
        const appRule = rule.oneOf.find(
          (item): item is Rule => isRule(item) && isAppGlobalCssRule(item),
        );
        if (appRule) return { oneOf: rule.oneOf, appRule };
      }
      const found = findAppRule(rule.oneOf) ?? findAppRule(rule.rules);
      if (found) return found;
    }
    return undefined;
  };

  const found = findAppRule(rules);
  if (!found) {
    console.warn(
      `${packageName}: could not find the next.js global-CSS rules. ` +
        "Please report this issue with your Next.js version at " +
        "https://github.com/DigitecGalaxus/next-yak/issues/new",
    );
    return;
  }

  found.oneOf.unshift({
    test: /\.yak\.css$/,
    sideEffects: true,
    use: [...(found.appRule.use as unknown[])],
  });
}
