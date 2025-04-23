# eslint-plugin-yak

ESLint plugin for [next-yak](https://yak.js.org/) - a powerful CSS-in-JS library for React applications.

Helps with the migration from `styled-components` to `next-yak`.

## Installation

```bash
npm install --save-dev eslint-plugin-yak
```

## Usage

TODO:

Add `yak` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["yak"]
}
```

Then configure the rules you want to use:

```json
{
  "rules": {
    "yak/css-nesting-operator": "error",
    "yak/enforce-semicolon": "error",
    "yak/style-conditions": "error"
  }
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
