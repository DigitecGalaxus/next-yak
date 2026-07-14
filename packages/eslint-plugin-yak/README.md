# eslint-plugin-yak

ESLint plugin for [next-yak](https://yak.js.org/) - a powerful CSS-in-JS library for React applications.

Helps with the migration from `styled-components` to `next-yak` and nudges you towards using it the most performant way.

## Installation

```bash
npm install --save-dev eslint-plugin-yak
```

## Usage

### Recommended

Import the plugin and add the recommended configuration

```js
import yakPlugin from "eslint-plugin-yak";
import { defineConfig } from "eslint/config";

export default defineConfig([yakPlugin.configs.recommended]);
```

### Customize

If you need to customize the recommended settings, you can just override the rules setting:

```js
import yakPlugin from "eslint-plugin-yak";
import { defineConfig } from "eslint/config";

export default defineConfig({
  plugins: {
    yak: yakPlugin,
  },
  rules: {
    "eslint-plugin-yak/css-nesting-operator": "error",
    "eslint-plugin-yak/enforce-semicolon": "warn",
    "eslint-plugin-yak/style-conditions": "off",
  },
});
```

## Rules

<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

| Name                                                                                                                                         | Description                                                                                                  | 🔧 | 💡 |
| :------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :- | :- |
| [css-global-deprecated](https://github.com/DigitecGalaxus/next-yak/blob/main/packages/eslint-plugin-yak/docs/rules/css-global-deprecated.md) | Deprecates :global() selectors in favor of native CSS transpilation                                          |    |    |
| [css-nesting-operator](https://github.com/DigitecGalaxus/next-yak/blob/main/packages/eslint-plugin-yak/docs/rules/css-nesting-operator.md)   | Enforces css selectors in next-yak to correctly use the nesting selector (&)                                 |    | 💡 |
| [enforce-semicolon](https://github.com/DigitecGalaxus/next-yak/blob/main/packages/eslint-plugin-yak/docs/rules/enforce-semicolon.md)         | Enforces that expression in styled/css literals from next-yak use semicolons                                 | 🔧 |    |
| [style-conditions](https://github.com/DigitecGalaxus/next-yak/blob/main/packages/eslint-plugin-yak/docs/rules/style-conditions.md)           | Warns when arrow functions in next-yak styled/css literals would create unnecessary or invalid CSS variables |    |    |

<!-- end auto-generated rules list -->
