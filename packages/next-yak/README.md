# next-yak

![A yak Riding on a rusty SWC Rocket](https://github.com/user-attachments/assets/72494b1c-db1a-4ff7-bd6f-2ed3535fb126)

[![npm version](https://badge.fury.io/js/next-yak.svg)](https://www.npmjs.com/package/next-yak)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DigitecGalaxus/next-yak/blob/main/LICENSE)

**next-yak** is a build-time CSS-in-JS library powered by a Rust SWC plugin. Write styled-components syntax, get zero-runtime CSS extraction and full React Server Components compatibility.

Works with **Next.js** (Webpack & Turbopack), **Vite** (7+, including Vite 8 with OXC), and **Storybook**. Any Vite-based framework works out of the box, including react-router, TanStack Start, and more.

> **Production-proven:** next-yak is sponsored and used in production by [Digitec Galaxus](https://www.galaxus.ch), the largest e-commerce platform in Switzerland, across thousands of styled components, delivering measurable improvements in Core Web Vitals.

## Features

- **Multi-Framework**: First-class support for Next.js (Webpack & Turbopack), Vite 7+ (react-router, TanStack Start, ...), and Storybook
- **Build-Time CSS**: Extracts CSS at compile time with zero runtime overhead
- **React Server Components**: Works seamlessly with both Server and Client Components
- **Cross-File Imports**: Import constants, mixins, and selectors from `.yak` files and other modules, works across all bundlers
- **Standard CSS Syntax**: Write familiar CSS with full nesting, keyframes, and media query support
- **Integrates with Atomic CSS**: Combines with utility-first frameworks like Tailwind CSS
- **TypeScript First**: Fully typed props, theme context, and cross-file selectors
- **Lightweight Runtime**: Minimal footprint, just swaps CSS class names based on props
- **Minimal Dependencies**: Only 8 dependencies in total (including transitive ones)

## Documentation

Full documentation, guides, and a live playground are available at **[yak.js.org](https://yak.js.org/)**.

- [Getting Started (Next.js)](https://yak.js.org/docs/getting-started)
- [Vite Setup](https://yak.js.org/docs/vite)
- [Storybook Setup](https://yak.js.org/docs/storybook)
- [Migration from styled-components](https://yak.js.org/docs/migration-from-styled-components)
- [Features](https://yak.js.org/docs/features)
- [Playground](https://yak.js.org/playground)

## Compatibility

| next-yak | Next.js   | Vite            | react       | swc_core |
| -------- | --------- | --------------- | ----------- | -------- |
| 9.x      | >= 16.1.0 | >= 7.0.0 (9.1+) | 19.x        | 56.0.0   |
| 8.x      | >= 16.0.0 | -               | 19.x        | 45.0.1   |
| 7.x      | >= 15.4.4 | -               | 19.x        | 38.0.1   |
| 6.x      | >= 15.4.1 | -               | 19.x        | 27.0.6   |
| 5.x      | >= 15.2.1 | -               | 19.x        | 16.0.0   |
| 4.x      | >= 15.0.4 | -               | 19.x        | 5.0.1    |
| 3.x      | 15.x      | -               | 18.x / 19.x | 3.0.2    |
| 2.x      | 14.x      | -               | 18.x / 19.x | 0.279.0  |

## Installation

```bash
npm install next-yak
```

## Quick Start

### Next.js

```js
// next.config.ts
import { withYak } from "next-yak/withYak";

export default withYak({
  // your next.js config
});
```

### Vite

```js
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteYak } from "next-yak/vite";

export default defineConfig({
  plugins: [viteYak(), react()],
});
```

### Usage

```jsx
import { styled } from "next-yak";

const Button = styled.button`
  background: #bf4f74;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
`;
```

## License

**next-yak** is licensed under the [MIT License](https://github.com/DigitecGalaxus/next-yak/blob/main/LICENSE).

## Contributing

Contributions are welcome! The [contributing guide](https://github.com/DigitecGalaxus/next-yak/blob/main/CONTRIBUTION.md) helps you get started.
