import fs from "node:fs";
import { cssNestingOperator } from "./rules/cssNestingOperator.js";
import { enforceSemicolons } from "./rules/enforceSemicolon.js";
import { styleConditions } from "./rules/styleConditions.js";

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
      [`${pkg.name}/style-conditions`]: "suggestion",
    },
  },
});

export default plugin;
