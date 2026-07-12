# @yak/solid

SolidJS runtime for [yak](https://yak.js.org/) — styled-components syntax with **zero-runtime CSS extraction**, built for Solid's fine-grained reactivity.

> **Status: experimental.** `@yak/solid` targets **Solid 2 (currently in beta)** and tracks it closely; expect breaking changes while Solid 2 stabilizes. Solid 1 is not supported (the runtime is structured so support can be added later — all version-specific APIs live behind `runtime/solid-compat.ts`).

## How it works

Like `next-yak`, the yak SWC compiler extracts your CSS at build time. At runtime only a tiny layer remains that merges class names and feeds dynamic values through CSS custom properties:

- Static styles become plain CSS classes — a static `styled.div` never subscribes to the theme and adds a single reactive `class` binding.
- Dynamic interpolations (`${(props) => ...}`) become CSS variables set on the element's inline `style`. Updates flow through one memo per component: the element is never re-created, only its `class`/`style` bindings change, and only props actually used by the CSS re-run the memo.

## Usage

```bash
pnpm add @yak/solid
pnpm add -D vite-plugin-solid@next
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { viteYakSolid } from "@yak/solid/vite";

export default defineConfig({
  plugins: [viteYakSolid(), solid()],
});
```

```tsx
import { styled, css, keyframes } from "@yak/solid";

const Button = styled.button<{ $primary?: boolean }>`
  color: #009688;
  ${({ $primary }) =>
    $primary &&
    css`
      border-width: 2px;
    `}
`;

const Hand = styled.div<{ $angle: number }>`
  transform: rotate(${({ $angle }) => $angle}deg);
`;
```

The `css` prop works on all intrinsic elements (uses Solid's `class` attribute):

```tsx
<p
  css={css`
    color: green;
  `}
/>
```

### Theming

Create a `yak.context.ts` next to your `vite.config.ts` (picked up automatically) and augment the `YakTheme` interface:

```ts
export function getYakThemeContext() {
  return { highContrast: false };
}

declare module "@yak/solid" {
  export interface YakTheme extends ReturnType<typeof getYakThemeContext> {}
}
```

The theme is reactive: pass a signal-backed value to `YakThemeProvider` and every themed style updates in place — no reload, no re-created elements.

## Differences to next-yak (React)

- `class` instead of `className` (Solid convention) — also inside `.attrs({ ... })`.
- No jsx-runtime export: Solid compiles JSX natively; the css prop types activate by importing `@yak/solid`.
- Components run once; dynamic styles are driven by Solid's reactivity instead of re-renders.

## Requirements

- `solid-js` >= 2.0.0-beta and `@solidjs/web` >= 2.0.0-beta
- `vite-plugin-solid` >= 3.0.0-next (the Solid 2 line, npm tag `next`)
- `yak-swc` with yak-package auto-detection (bundled as a dependency; requires the version released together with this package or newer)

See the [`examples/vite-solid`](https://github.com/DigitecGalaxus/next-yak/tree/main/examples/vite-solid) app for a full setup.
