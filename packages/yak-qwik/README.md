# @yak/qwik

styled-components syntax for Qwik 2, compiled to plain CSS at build time by the yak compiler. Beta: it tracks `@qwik.dev/core` 2.0.0-beta.43 and later.

```tsx
import { component$, useSignal } from "@qwik.dev/core";
import { styled, css } from "@yak/qwik";

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.5em 1em;
  border-radius: 4px;
  ${({ $primary }) =>
    $primary &&
    css`
      background: #0070f3;
      color: white;
    `}
`;

export default component$(() => {
  const primary = useSignal(true);
  return (
    <Button $primary={primary.value} onClick$={() => (primary.value = !primary.value)}>
      toggle
    </Button>
  );
});
```

## Install

```bash
npm install @yak/qwik
```

`@yak/qwik` peers on `@qwik.dev/core` (2.0.0-beta.43 or later) and Vite 8, the versions Qwik 2 itself requires.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { qwikVite } from "@qwik.dev/core/optimizer";
import { yak } from "@yak/qwik/vite";

export default defineConfig({
  // yak first, so it sees your original source code
  plugins: [yak(), qwikVite()],
});
```

```json
// tsconfig.json
{ "compilerOptions": { "jsx": "react-jsx", "jsxImportSource": "@qwik.dev/core" } }
```

## How a styled component renders

A styled component is a plain function, not a `component$`. Qwik inlines it into the parent's render: no lazy boundary, no serialized props, children arrive as a prop. On the server it costs one virtual node in Qwik's out-of-band vnode data and nothing in the HTML; a `component$` per element would serialize its props and a QRL for every instance.

Static usages fold away at build time. `<Button type="button">` with no runtime interpolation becomes `<button class="yX" type="button">`, which costs the same as a plain element. Every other usage runs the function, which on the server is about ten times a plain element (Qwik's inline-component path). Keep style values static where you can.

## Coming from next-yak

- `class`, not `className`, also inside `.attrs()`.
- `onClick$` and the other `$` handlers work on styled elements as on plain ones.
- The theme is an object, not an accessor: `useTheme()` returns it inside `component$` code, and style callbacks read `props.theme`.
- Provide the theme from `component$` code; the package ships no provider component so that it stays free of `$` and needs no Qwik library packaging:

```tsx
import { component$, useContextProvider, useStore, Slot } from "@qwik.dev/core";
import { YakThemeContext } from "@yak/qwik";

export const ThemeProvider = component$(() => {
  const theme = useStore({ mode: "light" });
  useContextProvider(YakThemeContext, theme);
  return <Slot />;
});
```

Styled components read the theme through Qwik's `_resolveContextWithoutSequentialScope`, the exported helper Qwik's own router uses for reads outside a hook scope. It is marked internal by Qwik, so this package pins the betas it was verified on.

- A `class` value may be a string, an array, an object or a Signal; a Signal is read inside the styled component, so the parent re-renders on change (Qwik's attribute-level signal binding does not apply to yak's merged class).
- Serving CSS in dev: Qwik loads no module on the client at startup, so the stylesheets a page needs are linked from the server render. `@qwik.dev/router`'s dev middleware does this for every CSS module in the graph; yak's CSS is a virtual module, which the router handles from the version that carries the fix in `patches/@qwik.dev__router@2.0.0-beta.43.patch` of the yak repository (served under `/@id/__x00__`, kept away from the file watcher). Use the router; a dev server of your own has to link the stylesheets itself. Production builds carry the CSS through Qwik's manifest injections.
- Dev HMR: an edit to a module with a `component$` re-renders in place, an edit to a module without one (a styled-only file) reloads the page. That is Qwik's dev server, not yak.

## Theming with `yak.context.ts`

As with next-yak, a `yak.context.ts` next to `vite.config.ts` provides the default theme:

```ts
// yak.context.ts
export const getYakThemeContext = () => ({ mode: "light" });

declare module "@yak/qwik" {
  export interface YakTheme {
    mode: "light" | "dark";
  }
}
```

## Example

`examples/vite-qwik` in the yak repository is a Qwik Router app with a themed page, a clock, keyframes and the css prop.

## Not supported

- `component$` targets receive `class` and `style` as plain props; they project children through `<Slot />` as usual.
- Qwik's `useStyles$` is not involved; yak's CSS is a Vite stylesheet.
