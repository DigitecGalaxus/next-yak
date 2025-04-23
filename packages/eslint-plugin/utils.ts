import { ESLintUtils } from "@typescript-eslint/utils";

export interface EsLintPluginYakRuleDocs {
  description: string;
  recommended?: boolean;
  requiresTypeChecking?: boolean;
}

export const createRule = ESLintUtils.RuleCreator<EsLintPluginYakRuleDocs>(
  (name) =>
    `https://github.com/DigitecGalaxus/next-yak/packages/eslint-plugin/docs/rules/${name}.md`,
);
