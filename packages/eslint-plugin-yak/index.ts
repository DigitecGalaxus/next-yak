import pkg from "./package.json" with { type: "json" };
import { cssNestingOperator } from "./rules/cssNestingOperator.js";
import { enforceSemicolons } from "./rules/enforceSemicolon.js";
import { styleConditions } from "./rules/styleConditions.js";

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  configs: {},
  rules: {
    "css-nesting-operator": cssNestingOperator,
    "enforce-semicolon": enforceSemicolons,
    "style-conditions": styleConditions,
  },
  processors: {},
};

Object.assign(plugin.configs, {
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
});

export const rules = plugin.rules;
export const configs = plugin.configs;
export const processors = plugin.processors;
export const meta = plugin.meta;
export const name = plugin.meta.name;
export const version = plugin.meta.version;
export default plugin;
