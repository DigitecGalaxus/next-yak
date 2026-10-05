import pkg from "./package.json" with { type: "json" };
import { eslintCompatPlugin } from "@oxlint/plugins";
import { cssNestingOperator } from "./rules/cssNestingOperator.js";
import { enforceSemicolons } from "./rules/enforceSemicolon.js";
import { styleConditions } from "./rules/styleConditions.js";

const compatPlugin = eslintCompatPlugin({
  meta: {
    name: pkg.name,
  },
  rules: {
    "css-nesting-operator": cssNestingOperator,
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

// ESLint's prefix for a scoped plugin (@yak/eslint-plugin -> @yak).
// Oxlint derives the same prefix from `meta.name`
const prefix = "@yak";

const configs = {
  recommended: {
    plugins: {
      [prefix]: plugin,
    },
    rules: {
      [`${prefix}/css-nesting-operator`]: "error",
      [`${prefix}/enforce-semicolon`]: "error",
      [`${prefix}/style-conditions`]: "warn",
    },
  },
};

export default Object.assign(plugin, {
  configs,
});
