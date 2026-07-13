import { ESLintUtils } from "@typescript-eslint/utils";

export interface EsLintPluginYakRuleDocs {
  description: string;
  recommended?: boolean;
  requiresTypeChecking?: boolean;
}

export const createRule = ESLintUtils.RuleCreator<EsLintPluginYakRuleDocs>(
  (name) =>
    `https://github.com/DigitecGalaxus/next-yak/blob/main/packages/eslint-plugin-yak/docs/rules/${name}.md`,
);
