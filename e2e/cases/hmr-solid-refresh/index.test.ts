import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR: editing a styled-only file hot-applies CSS and preserves signal state",
  withTestEnv("hmr-solid-refresh", async (testEnv, page) => {
    await page.goto(testEnv.url);

    const divider = page.getByTestId("divider");
    const counter = page.getByTestId("counter");
    const increment = page.getByTestId("increment");

    // Verify initial CSS
    await expect(divider).toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(counter).toHaveText("0");

    // Set state that would be lost on full reload or component re-creation
    await increment.click();
    await increment.click();
    await expect(counter).toHaveText("2");

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // Edit the styled-only file — change CSS color
    const src = await testEnv.readFile("Divider.tsx");
    await testEnv.writeFile(
      "Divider.tsx",
      src.replace("background-color: red", "background-color: blue"),
    );

    // Wait for HMR to apply the CSS change
    await expect(divider).toHaveCSS("background-color", "rgb(0, 0, 255)", {
      timeout: 30_000,
    });

    // Verify no full page reload occurred
    expect(await page.evaluate(() => window.__hmr)).toBe(true);

    await expect(counter).toHaveText("2");
  }),
);
