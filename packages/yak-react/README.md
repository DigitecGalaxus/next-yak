# @yak/react

![A yak Riding on a rusty SWC Rocket](https://github.com/user-attachments/assets/72494b1c-db1a-4ff7-bd6f-2ed3535fb126)

[![@yak/react version](https://npmx.dev/api/registry/badge/version/@yak/react)](https://npmx.dev/package/@yak/react)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/galaxuslabs/yak/blob/main/LICENSE)

**@yak/react** is [yak](https://yak.js.org/) for React: zero-runtime CSS-in-JS with styled-components syntax. A Rust SWC plugin compiles your styles to plain CSS files at build time, so it works with React Server Components and ships no styling runtime to the browser.

Works with **Next.js** (webpack and Turbopack), **Vite** 7+ (including Vite 8 with Rolldown), **Rsbuild** 2+ and **Storybook**. Any Vite-based framework works too, including react-router and TanStack Start.

> **Formerly next-yak.** Versions before 10 stay on npm as [`next-yak`](https://www.npmjs.com/package/next-yak). The [migration guide](https://yak.js.org/docs/migration-from-next-yak) covers the switch.

yak runs in production at [Digitec Galaxus](https://www.galaxus.ch), the largest e-commerce platform in Switzerland, across thousands of styled components.

## Features

- **Build-time CSS**: styles become plain CSS files at compile time, and the bundler's own CSS pipeline handles them
- **React Server Components**: works in Server and Client Components alike
- **Next.js, Vite and Rsbuild**: Next.js with webpack or Turbopack, Vite 7+ (react-router, TanStack Start, ...), Rsbuild 2+ and Storybook
- **Cross-file imports**: import constants, mixins and selectors from `.yak` files and other modules
- **Standard CSS**: nesting, keyframes and media queries as you write them in a stylesheet
- **Atomic CSS**: mixes with utility classes from Tailwind and similar frameworks
- **TypeScript first**: typed props, theme and cross-file selectors
- **Small runtime**: it only swaps class names and CSS variables based on props
- **Few dependencies**: [![direct dependencies of @yak/react](https://npmx.dev/api/registry/badge/dependencies/@yak/react)](https://npmx.dev/package/@yak/react), all of them build-time tools

## Documentation

Full documentation, guides, and a live playground are available at **[yak.js.org](https://yak.js.org/)**.

- [Getting Started (Next.js)](https://yak.js.org/docs/getting-started)
- [Vite Setup](https://yak.js.org/docs/vite)
- [Rsbuild Setup](https://yak.js.org/docs/rsbuild)
- [Storybook Setup](https://yak.js.org/docs/storybook)
- [Migration from next-yak](https://yak.js.org/docs/migration-from-next-yak)
- [Migration from styled-components](https://yak.js.org/docs/migration-from-styled-components)
- [API reference](https://yak.js.org/docs/api)
- [Features](https://yak.js.org/docs/features)
- [Playground](https://yak.js.org/playground)

## Compatibility

| Version | Next.js   | Vite     | Rsbuild | React | swc_core |
| ------- | --------- | -------- | ------- | ----- | -------- |
| 10.x    | >= 16.4.0 | >= 7.0.0 | >= 2.0  | 19.x  | 79.0.0   |

For older versions, see the [`next-yak` compatibility table](https://github.com/galaxuslabs/yak#compatibility).

## Installation

```bash
npm install @yak/react
```

## Quick Start

### Next.js

```js
// next.config.ts
import { withYak } from "@yak/react/withYak";

export default withYak({
  // your next.js config
});
```

### Vite

```js
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteYak } from "@yak/react/vite";

export default defineConfig({
  plugins: [viteYak(), react()],
});
```

### Rsbuild

```js
// rsbuild.config.ts
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginYak } from "@yak/react/rsbuild";

export default defineConfig({
  plugins: [pluginReact(), pluginYak()],
});
```

### Usage

```jsx
import { styled } from "@yak/react";

const Button = styled.button`
  background: #bf4f74;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
`;
```

### Jest

`@yak/react` is ESM only. With `next/jest`, add it to `transpilePackages` in your Next.js config, so that Jest can load it:

```js
// next.config.mjs
const nextConfig = {
  transpilePackages: ["@yak/react"],
};
```

## License

**@yak/react** is licensed under the [MIT License](https://github.com/galaxuslabs/yak/blob/main/packages/yak-react/LICENSE).

## Contributing

Contributions are welcome! The [contributing guide](https://github.com/galaxuslabs/yak/blob/main/CONTRIBUTION.md) helps you get started.
