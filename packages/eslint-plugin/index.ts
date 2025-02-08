import fs from "node:fs";
import { yakCssNestingOperator } from "./rules/cssNestingOperator.js";
import { yakEnforceSemicolons } from "./rules/enforceSemicolon.js";
import { yakStyleConditions } from "./rules/styleConditions.js";

const pkg = JSON.parse(
  fs.readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  configs: {},
  rules: {
    "css-nesting-operator": yakCssNestingOperator,
    "enforce-semicolon": yakEnforceSemicolons,
    "style-conditions": yakStyleConditions,
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
      [`${pkg.name}/style-conditions`]: "suggestion",
    },
  },
});

export default plugin;
