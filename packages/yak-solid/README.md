# @yak/solid

SolidJS runtime for [yak](https://yak.js.org/): styled-components syntax, compiled to plain CSS at build time, with dynamic values driven by Solid's fine-grained reactivity.

> **Status: experimental.** `@yak/solid` targets Solid 2 (currently at RC) and tracks it closely. Expect breaking changes while Solid 2 stabilizes. Solid 1 is not supported. This includes SolidStart v2, which runs on Solid 1.

## How it works

Like `next-yak`, the yak SWC compiler extracts your CSS at build time. At runtime only a tiny layer remains that merges class names and feeds dynamic values through CSS custom properties:

- Static styles become plain CSS classes. A static `styled.div` never subscribes to the theme and adds a single reactive `class` binding.
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
import { yak } from "@yak/solid/vite";

export default defineConfig({
  plugins: [yak(), solid()],
});
```

```tsx
import { styled, css, keyframes } from "@yak/solid";

const Button = styled.button<{ $primary?: boolean }>`
  color: #009688;
  ${(props) =>
    props.$primary &&
    css`
      border-width: 2px;
    `}
`;

const Hand = styled.div<{ $angle: number }>`
  transform: rotate(${(props) => props.$angle}deg);
`;
```

Interpolation functions re-run inside the component's style memo, so destructuring their parameter (`${({ $angle }) => ...}`) is also safe. These docs use the `props` style because it matches Solid's conventions.

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

`useTheme()` returns an accessor, like a signal getter. Call it where the value is used. That read subscribes the surrounding scope to theme changes:

```tsx
import { styled, useTheme, YakThemeProvider } from "@yak/solid";

const Button = styled.button`
  color: ${(props) => (props.theme().highContrast ? "#000" : "#555")};
`;

function Toolbar() {
  const theme = useTheme();
  return <span>{theme().highContrast ? "High contrast" : "Default"}</span>;
}

// app root: the theme prop is reactive, signal reads inside it stay live
<YakThemeProvider theme={{ highContrast: highContrast() }}>
  <App />
</YakThemeProvider>;
```

The package also exports the context itself for native composition, e.g. overriding the theme for a subtree. In Solid 2 a context is its own provider and takes an accessor:

```tsx
import { createMemo } from "solid-js";
import { YakThemeContext, useTheme } from "@yak/solid";

function InvertedSection(props) {
  const parent = useTheme();
  const inverted = createMemo(() => ({ ...parent(), highContrast: true }));
  return <YakThemeContext value={inverted}>{props.children}</YakThemeContext>;
}
```

## Differences to next-yak (React)

- `useTheme()` returns an accessor: read `theme().highContrast`, not `theme.highContrast`. The same applies to `props.theme()` in interpolations and `.attrs()`.
- `class` instead of `className` (Solid convention), also inside `.attrs({ ... })`.
- No jsx-runtime export: Solid compiles JSX natively. The css prop types activate by importing `@yak/solid`.
- Components run once. Solid's reactivity drives dynamic styles instead of re-renders.
- `foldStatic` is off by default (see [Static folding](#static-folding-opt-in) below).

## Static folding (opt-in)

`yak({ foldStatic: true })` additionally folds usages of fully static components into plain elements at build time, removing their wrapper components. It is off by default as we didn't test all the edge-cases and can't guarantee it works correctly everywhere.

## Requirements

- `solid-js` >= 2.0.0-rc.0 and `@solidjs/web` >= 2.0.0-rc.0
- `vite-plugin-solid` >= 3.0.0-next (the Solid 2 line, npm tag `next`)
- `yak-swc` with yak-package auto-detection (bundled as a dependency, version released together with this package or newer)

See the [`examples/vite-solid`](https://github.com/DigitecGalaxus/next-yak/tree/main/examples/vite-solid) app for a full setup.
