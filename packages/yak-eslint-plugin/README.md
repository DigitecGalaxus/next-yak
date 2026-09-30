# @yak/eslint-plugin

ESLint and Oxlint plugin for [yak](https://yak.js.org/), the build-time CSS-in-JS library for React (`@yak/react`) and Solid (`@yak/solid`).

It helps you migrate from `styled-components` to yak and shows you the patterns that compile to the fastest CSS.

Both ESLint and Oxlint use the rule prefix `@yak/`, for example `@yak/css-nesting-operator`.

## Installation

```bash
npm install --save-dev @yak/eslint-plugin
```

## ESLint

### Recommended

Import the plugin and add the recommended configuration

```js
import yakPlugin from "@yak/eslint-plugin";
import { defineConfig } from "eslint/config";

export default defineConfig([yakPlugin.configs.recommended]);
```

### Customize

To change the recommended settings, register the plugin as `@yak` and set the rules:

```js
import yakPlugin from "@yak/eslint-plugin";
import { defineConfig } from "eslint/config";

export default defineConfig({
  plugins: {
    "@yak": yakPlugin,
  },
  rules: {
    "@yak/css-nesting-operator": "error",
    "@yak/enforce-semicolon": "warn",
    "@yak/style-conditions": "off",
  },
});
```

## Oxlint

Add the package to `jsPlugins` and enable the rules with their `@yak/` prefix:

```jsonc
// .oxlintrc.json
{
  "jsPlugins": ["@yak/eslint-plugin"],
  "rules": {
    "@yak/css-nesting-operator": "error",
    "@yak/css-global-deprecated": "warn",
    "@yak/enforce-semicolon": "error",
    "@yak/style-conditions": "warn"
  }
}
```

## Rules

<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
⚠️ Configurations set to warn in.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

| Name                                                                                                                                         | Description                                                                                             | 💼 | ⚠️ | 🔧 | 💡 |
| :------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ | :- | :- | :- | :- |
| [css-global-deprecated](https://github.com/DigitecGalaxus/next-yak/blob/main/packages/yak-eslint-plugin/docs/rules/css-global-deprecated.md) | Deprecates :global() selectors in favor of native CSS transpilation                                     |    | ✅  |    |    |
| [css-nesting-operator](https://github.com/DigitecGalaxus/next-yak/blob/main/packages/yak-eslint-plugin/docs/rules/css-nesting-operator.md)   | Enforces css selectors in yak to correctly use the nesting selector (&)                                 | ✅  |    |    | 💡 |
| [enforce-semicolon](https://github.com/DigitecGalaxus/next-yak/blob/main/packages/yak-eslint-plugin/docs/rules/enforce-semicolon.md)         | Enforces that expression in styled/css literals from yak use semicolons                                 | ✅  |    | 🔧 |    |
| [style-conditions](https://github.com/DigitecGalaxus/next-yak/blob/main/packages/yak-eslint-plugin/docs/rules/style-conditions.md)           | Warns when arrow functions in yak styled/css literals would create unnecessary or invalid CSS variables |    | ✅  |    |    |

<!-- end auto-generated rules list -->
