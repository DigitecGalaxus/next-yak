import { defineRule } from "@oxlint/plugins";
import type { Rule } from "@oxlint/plugins";

export function createRule<TRule extends Rule>(name: string, rule: TRule): TRule {
  return defineRule({
    ...rule,
    meta: {
      ...rule.meta,
      docs: {
        ...rule.meta?.docs,
        url: `https://github.com/DigitecGalaxus/next-yak/blob/main/packages/eslint-plugin-yak/docs/rules/${name}.md`,
      },
    },
  }) as TRule;
}
