import type { ESLint, Linter } from "eslint";
import pkg from "./package.json" with { type: "json" };
import { cssNestingOperator } from "./rules/cssNestingOperator.js";
import { enforceSemicolons } from "./rules/enforceSemicolon.js";
import { styleConditions } from "./rules/styleConditions.js";

const plugin: ESLint.Plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  rules: {
    "css-nesting-operator": cssNestingOperator as any,
    "enforce-semicolon": enforceSemicolons as any,
    "style-conditions": styleConditions as any,
  },
  processors: {},
};

const configs = {
  recommended: {
    plugins: {
      [pkg.name]: plugin,
    },
    rules: {
      [`${pkg.name}/css-nesting-operator`]: "error",
      [`${pkg.name}/enforce-semicolon`]: "error",
      [`${pkg.name}/style-conditions`]: "warn",
    },
  },
} as const satisfies { recommended: Linter.Config };

export default Object.assign(plugin, {
  configs,
});
