import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR: editing styled-only file does not cause full reload when imported through non-boundary chain",
  withTestEnv("hmr-styled-refresh-boundary", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const divider = page.getByTestId("divider");
    const counter = page.getByTestId("counter");
    const increment = page.getByTestId("increment");

    // Verify initial CSS
    await expect(divider).toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(counter).toHaveText("0");

    // Set state that would be lost on full reload
    await increment.click();
    await increment.click();
    await expect(counter).toHaveText("2");

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // Edit the styled-only file -- change CSS color.
    // The import chain is: Divider.tsx -> barrel.ts -> pageUtils.ts -> App.tsx
    // None of these modules are React Fast Refresh boundaries because:
    //   - Divider.tsx: styled() function .name = "yak" (lowercase, not recognized)
    //   - barrel.ts: has namespace export (not a component type)
    //   - pageUtils.ts: mixed exports (component + constant)
    //   - App.tsx: mixed exports (component + function)
    // Without the fix, the update propagates to the entry point -> full reload.
    const src = await fsTmp.readFile("Divider.tsx");
    await fsTmp.writeFile(
      "Divider.tsx",
      src.replace("background-color: red", "background-color: blue"),
    );

    // Wait for HMR to apply the CSS change
    await expect(divider).toHaveCSS("background-color", "rgb(0, 0, 255)", {
      timeout: 30_000,
    });

    // Verify no full page reload occurred
    expect(await page.evaluate(() => window.__hmr)).toBe(true);

    // Verify React state was preserved (counter didn't reset)
    await expect(counter).toHaveText("2");
  }),
);
