# @yak/solid

Styled-components syntax for SolidJS, compiled away at build time. Your CSS is extracted by the [yak](https://yak.js.org/) SWC compiler and what's left at runtime is a thin layer that fits Solid's model: components run once, and dynamic styles are driven by signals, not re-renders.

> **Status: experimental.** `@yak/solid` targets Solid 2 (currently at RC) and tracks it closely. Expect breaking changes while Solid 2 stabilizes. Solid 1 is not supported, and neither is SolidStart v2, which still runs on Solid 1.

## Why this fits Solid

Most CSS-in-JS libraries assume a re-rendering component model. `@yak/solid` doesn't. It works the way you'd expect Solid code to work:

- **Static styles are just classes.** A `styled.div` with no interpolations compiles to a plain CSS class and a single reactive `class` binding.
- **Dynamic styles are signals in, CSS variables out.** Interpolations like `${(props) => props.$angle}` become CSS custom properties on the element's inline `style`. All of them are computed in one memo per component. When a prop changes, the element is not re-created, only its `class`/`style` bindings update, and the memo only re-runs for props the CSS actually reads.
- **No hidden subscriptions.** Reads inside interpolations are tracked like any other reactive read in Solid. If your CSS doesn't read `props.theme()`, it doesn't subscribe to the theme.

## Getting started

```bash
pnpm add @yak/solid
pnpm add -D vite-plugin-solid@next
```

Add the yak plugin before `solid()` in your Vite config:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { yak } from "@yak/solid/vite";

export default defineConfig({
  plugins: [yak(), solid()],
});
```

Then write styled components the way you'd write them anywhere else. Prop-based interpolations are tracked reactively:

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

The `css` prop works on every intrinsic element and maps to Solid's `class` attribute:

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

`useTheme()` returns an accessor, like a signal getter. Call it where the value is used. That read is what subscribes the surrounding scope to theme changes:

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

The theme context itself is exported too, so you can compose it natively, e.g. to override the theme for a subtree. In Solid 2 a context is its own provider and takes an accessor:

```tsx
import { createMemo } from "solid-js";
import { YakThemeContext, useTheme } from "@yak/solid";

function InvertedSection(props) {
  const parent = useTheme();
  const inverted = createMemo(() => ({ ...parent(), highContrast: true }));
  return <YakThemeContext value={inverted}>{props.children}</YakThemeContext>;
}
```

## Coming from next-yak or React?

If you've used `next-yak`, the API is the same with a few Solid-shaped differences:

- `useTheme()` returns an accessor: read `theme().highContrast`, not `theme.highContrast`. The same applies to `props.theme()` in interpolations and in `.attrs()`.
- `class` instead of `className`, including inside `.attrs({ ... })`.
- No jsx-runtime export. Solid compiles JSX natively, which means the `css` prop types activate simply by importing `@yak/solid`.
- Components run once. There is no re-render to recompute styles and Solid's reactivity handles it.

## How it works

Like `next-yak`, the yak SWC compiler extracts your CSS at build time. At runtime only a tiny layer remains that merges class names and feeds dynamic values through CSS custom properties:

- Static styles become plain CSS classes. A static `styled.div` never subscribes to the theme and adds a single reactive `class` binding.
- Dynamic interpolations (`${(props) => ...}`) become CSS variables set on the element's inline `style`. Updates flow through one memo per component: the element is never re-created, only its `class`/`style` bindings change, and only props actually used by the CSS re-run the memo.

## Requirements

- `solid-js` >= 2.0.0-rc.5 and `@solidjs/web` >= 2.0.0-rc.5
- `vite-plugin-solid` >= 3.0.0-next (the Solid 2 line, npm tag `next`)
- `yak-swc` with yak-package auto-detection (bundled as a dependency, version released together with this package or newer)

See the [`examples/vite-solid`](https://github.com/DigitecGalaxus/next-yak/tree/main/examples/vite-solid) app for a full setup.
