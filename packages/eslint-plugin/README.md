# eslint-plugin-yak

ESLint plugin for [next-yak](https://yak.js.org/) - a powerful CSS-in-JS library for React applications.

Helps with the migration from `styled-components` to `next-yak`.

## Installation

```bash
npm install --save-dev eslint-plugin-yak
```

## Usage

### Recommended

Import the plugin and add the recommended configuration

```js
import yakPlugin from "eslint-plugin-yak";

export default config = {
  yakPlugin.configs.recommended,
}
```

### Customize

If you need to customize the recommended settings, you can just override the rules setting:

```js
export default config = {
  {
    ...yakPlugin.configs.recommended,
    rules: {
      ...yakPlugin.configs.recommended.rules,
      "eslint-plugin-yak/style-conditions": "off", // or any other rule
    },
  },
}
```

## Rules

<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).\
💭 Requires [type information](https://typescript-eslint.io/linting/typed-linting).

| Name                                                       | Description                                                                                                   | 🔧 | 💡 | 💭 |
| :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ | :- | :- | :- |
| [css-nesting-operator](docs/rules/css-nesting-operator.md) | Enforces css selectors in next-yak to correctly use the nesting selector (&)                                  |    | 💡 |    |
| [enforce-semicolon](docs/rules/enforce-semicolon.md)       | Enforces that expression in styled/css literals from next-yak use semicolons                                  | 🔧 |    |    |
| [style-conditions](docs/rules/style-conditions.md)         | Enforces that arrow functions only return runtime values or css literals in styled/css literals from next-yak |    |    | 💭 |

<!-- end auto-generated rules list -->
