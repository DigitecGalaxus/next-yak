import pkg from "./package.json" with { type: "json" };
import { eslintCompatPlugin } from "@oxlint/plugins";
import { cssNestingOperator } from "./rules/cssNestingOperator.js";
import { cssGlobalDeprecated } from "./rules/cssGlobalDeprecated.js";
import { enforceSemicolons } from "./rules/enforceSemicolon.js";
import { styleConditions } from "./rules/styleConditions.js";

const compatPlugin = eslintCompatPlugin({
  meta: {
    name: pkg.name,
  },
  rules: {
    "css-nesting-operator": cssNestingOperator,
    "css-global-deprecated": cssGlobalDeprecated,
    "enforce-semicolon": enforceSemicolons,
    "style-conditions": styleConditions,
  },
});

const plugin = {
  ...compatPlugin,
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
};

const configs = {
  recommended: {
    plugins: {
      [pkg.name]: plugin,
    },
    rules: {
      [`${pkg.name}/css-nesting-operator`]: "error",
      [`${pkg.name}/css-global-deprecated`]: "warn",
      [`${pkg.name}/enforce-semicolon`]: "error",
      [`${pkg.name}/style-conditions`]: "warn",
    },
  },
};

export default Object.assign(plugin, {
  configs,
});
