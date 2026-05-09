# E2E Tests

next-yak spans multiple layers — an SWC plugin (Rust → WASM), bundler integrations (webpack, Vite), React runtime, and the browser's CSS engine. Unit and snapshot tests verify each layer in isolation, but can't catch issues at the seams: a CSS rule that extracts correctly but doesn't apply in the browser, or an HMR update that triggers a full reload instead of a hot swap.

These e2e tests run real dev servers **and** production builds with Playwright to verify that styled components render with the correct CSS in an actual browser.

## Structure

```
e2e/
├── e2eEnvironment.ts      # Shared infrastructure (assembly, server lifecycle, runner)
├── runDevTests.ts          # Entry point — runs tests against dev servers
├── runBuildTests.ts        # Entry point — runs tests against production builds
├── test-env.ts             # withTestEnv() helper used by all tests
├── playwright-base.ts      # Shared Playwright config factory
├── cases/
│   └── <name>/
│       ├── index.tsx          # Component under test
│       └── index.test.ts      # Playwright test
└── bundlers/
    └── <name>/
        ├── package.json        # Bundler dependencies (excluded from .tmp)
        ├── playwright.config.ts # Playwright config (excluded from .tmp)
        ├── vite.config.ts       # Bundler config  ──┐
        ├── index.html           # Entry point        ├─ copied to .tmp
        └── main.tsx             # App bootstrap    ──┘
```

## How it works

For each bundler, `e2eEnvironment.ts`:

1. **Assembles** `bundlers/<bundler>/.tmp/` — copies all case files and expands bundler template files (replacing `[case-name]` placeholders) to mount every case as a route
2. **Starts** a single server (dev or production) for the bundler
3. **Runs** Playwright per case with `BUNDLER` + `CASE` env vars

**Dev tests** (`runDevTests.ts`) start dev servers. **Build tests** (`runBuildTests.ts`) run `build` first, then start production servers. HMR cases are automatically excluded from build tests.

## Running

```bash
# Dev tests
pnpm --filter next-yak-e2e test                     # all bundlers x all cases
pnpm --filter next-yak-e2e test next-app-webpack    # just Next.js with webpack
pnpm --filter next-yak-e2e test vite yak-file-mixin # just Vite with one case

# Build tests (production)
pnpm --filter next-yak-e2e test:build               # all bundlers x non-HMR cases
pnpm --filter next-yak-e2e test:build vite           # just Vite production build
```

## Adding a test case

Create `cases/<name>/index.tsx` and `cases/<name>/index.test.ts`:

```tsx
// cases/my-case/index.tsx
import { styled } from "next-yak";
const Box = styled.div`
  background: blue;
`;
export default function App() {
  return <Box data-testid="box">Test</Box>;
}
```

```ts
// cases/my-case/index.test.ts
import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "applies background",
  withTestEnv("my-case", async (fsTmp, page) => {
    await page.goto(fsTmp.url);
    await expect(page.getByTestId("box")).toHaveCSS("background-color", "rgb(0, 0, 255)");
  }),
);
```

New cases are discovered automatically.

## Adding a bundler

1. Create `bundlers/<name>/package.json` with bundler + next-yak dependencies and `dev`, `build`, `start` scripts
2. Add bundler config (`vite.config.ts`, `next.config.mjs`, etc.)
3. Add entry point files (`index.html` + `main.tsx` for Vite, `app/layout.tsx` + `app/page.tsx` for Next.js)
4. Create `bundlers/<name>/playwright.config.ts` using `basePlaywrightConfig` from `playwright-base.ts`

New bundlers are discovered automatically from `bundlers/*/playwright.config.ts`.
