import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR updates CSS without full page reload",
  withTestEnv("hmr-css-change", async (fsTmp, page) => {
    await page.goto(fsTmp.url);
    const box = page.getByTestId("box");
    await expect(box).toHaveCSS("color", "rgb(255, 0, 0)");

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // Modify the source file
    const src = await fsTmp.readFile("App.tsx");
    await fsTmp.writeFile("App.tsx", src.replace("color: red", "color: blue"));

    // Wait for HMR to apply the change
    await expect(box).toHaveCSS("color", "rgb(0, 0, 255)", {
      timeout: 15_000,
    });

    // Verify no full page reload occurred
    expect(await page.evaluate(() => window.__hmr)).toBe(true);
  }),
);
