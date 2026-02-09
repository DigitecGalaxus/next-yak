# E2E Tests

next-yak spans multiple layers — an SWC plugin (Rust → WASM), bundler integrations (webpack, Vite), React runtime, and the browser's CSS engine. Unit and snapshot tests verify each layer in isolation, but can't catch issues at the seams: a CSS rule that extracts correctly but doesn't apply in the browser, or an HMR update that triggers a full reload instead of a hot swap.

These e2e tests run real dev servers with Playwright to verify that styled components render with the correct CSS in an actual browser.

## Structure

```
e2e/
├── run.ts                  # Orchestrator — assembles .tmp dirs, spawns Playwright
├── test-env.ts             # withTestEnv() helper used by all tests
├── playwright-base.ts      # Shared Playwright config factory
├── cases/
│   └── <name>/
│       ├── App.tsx          # Component under test
│       └── test.ts          # Playwright test
└── bundlers/
    └── <name>/
        ├── package.json        # Bundler dependencies (excluded from .tmp)
        ├── playwright.config.ts # Playwright config (excluded from .tmp)
        ├── vite.config.ts       # Bundler config  ──┐
        ├── index.html           # Entry point        ├─ copied to .tmp
        └── main.tsx             # App bootstrap    ──┘
```

## How it works

For each (bundler x case), `run.ts`:

1. **Assembles** `bundlers/<bundler>/.tmp/<case>/` — copies case files first (they win), then fills in bundler template files that aren't already present
2. **Spawns** `playwright test` with `BUNDLER` + `CASE` env vars — Playwright starts a dev server from `.tmp/<case>/` and runs `cases/<case>/test.ts`

## Running

```bash
pnpm --filter next-yak-e2e test                   # all bundlers x all cases
pnpm --filter next-yak-e2e test next-app-webpack  # just Next.js with webpack
pnpm --filter next-yak-e2e test vite              # just Vite
```

## Adding a test case

Create `cases/<name>/App.tsx` and `cases/<name>/test.ts`:

```tsx
// cases/my-case/App.tsx
import { styled } from "next-yak";
const Box = styled.div`background: blue;`;
export default function App() {
  return <Box data-testid="box">Test</Box>;
}
```

```ts
// cases/my-case/test.ts
import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test("applies background", withTestEnv("my-case", async (fsTmp, page) => {
  await page.goto(fsTmp.url);
  await expect(page.getByTestId("box")).toHaveCSS("background-color", "rgb(0, 0, 255)");
}));
```

New cases are discovered automatically.

## Adding a bundler

1. Create `bundlers/<name>/package.json` with bundler + next-yak dependencies
2. Add bundler config (`vite.config.ts`, `next.config.mjs`, etc.)
3. Add entry point files (`index.html` + `main.tsx` for Vite, `app/layout.tsx` + `app/page.tsx` for Next.js)
4. Create `bundlers/<name>/playwright.config.ts` using `basePlaywrightConfig` from `playwright-base.ts`

New bundlers are discovered automatically from `bundlers/*/playwright.config.ts`.
