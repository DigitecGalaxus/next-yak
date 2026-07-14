import pkg from "./package.json" with { type: "json" };
import { cssNestingOperator } from "./rules/cssNestingOperator.js";
import { cssGlobalDeprecated } from "./rules/cssGlobalDeprecated.js";
import { enforceSemicolons } from "./rules/enforceSemicolon.js";
import { precomputeStylePropValues } from "./rules/precomputeStylePropValues.js";
import { styleConditions } from "./rules/styleConditions.js";

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  rules: {
    "css-nesting-operator": cssNestingOperator,
    "css-global-deprecated": cssGlobalDeprecated,
    "enforce-semicolon": enforceSemicolons,
    "style-conditions": styleConditions,
    "precompute-style-prop-values": precomputeStylePropValues,
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
      [`${pkg.name}/css-global-deprecated`]: "warn",
      [`${pkg.name}/enforce-semicolon`]: "error",
      [`${pkg.name}/style-conditions`]: "warn",
      [`${pkg.name}/precompute-style-prop-values`]: "warn",
    },
  },
};

export default Object.assign(plugin, {
  configs,
});
