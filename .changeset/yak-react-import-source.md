---
"next-yak": patch
"eslint-plugin-yak": patch
"storybook-addon-yak": patch
---

Internal: the build takes the package name from `package.json`. The ESLint plugin now also checks files that import from `@yak/solid`.
