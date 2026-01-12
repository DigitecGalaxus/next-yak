# storybook-addon-yak

Storybook addon for [next-yak](https://yak.js.org/) - a CSS-in-JS library that combines styled-components syntax with build-time CSS extraction.

Supports both Vite and Webpack Storybook builders.

## Installation

```bash
npm install --save-dev storybook-addon-yak
```

## Usage

Add the addon to your Storybook configuration:

```ts
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  addons: ["storybook-addon-yak"],
  // ...
};

export default config;
```

For Webpack, ensure you also have the SWC compiler addon:

```ts
addons: [
  "@storybook/addon-webpack5-compiler-swc",
  "storybook-addon-yak",
],
```

## Documentation

See the full documentation at [yak.js.org/docs/storybook](https://yak.js.org/docs/storybook).
