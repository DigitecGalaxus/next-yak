# Vite + next-yak example

This example shows how to use **next-yak** in a plain React + Vite app using the `viteYak` plugin.

## Prerequisites

This folder is part of the monorepo and assumes you are in the project root.

- Use `pnpm` (see `packageManager` in `package.json`).
- Build the shared packages once before building the example:

```bash
pnpm install
pnpm --filter yak-swc build
pnpm --filter next-yak build
```

## Running the example

From the repo root:

```bash
pnpm --filter vite-yak-example dev
```

Then open the URL printed by Vite (usually http://localhost:5173).

You can also build and preview:

```bash
pnpm --filter vite-yak-example build
pnpm --filter vite-yak-example preview
```

## How next-yak is wired in

Key files to look at:

- `vite.config.ts` – integrates the `viteYak` plugin:
  - `import { viteYak } from 'next-yak/vite';`
  - `plugins: [react(), viteYak()]`
- `yak.context.ts` – defines the `YakTheme` and theme context used by `YakThemeProvider`.
- `src/main.tsx` – wraps the app in `YakThemeProvider` with `getYakThemeContext()`.
- `src/App.tsx` – demonstrates `styled`, `css`, `atoms`, and usage of build-time constants from `.yak` files.
- `src/theme/*.yak.ts` – shows how to define design tokens in yak files that are evaluated at build time.

For more details, see the [Vite docs page](../../docs/content/docs/vite.mdx) in this repository or the hosted documentation at https://yak.js.org/docs/vite.
