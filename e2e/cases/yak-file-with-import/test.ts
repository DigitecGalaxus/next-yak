import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR updates when transitive .ts dependency of .yak.ts changes",
  withTestEnv("yak-file-with-import", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const box = page.getByTestId("box");
    await expect(box).toHaveCSS("padding", "24px");
    await expect(box).toHaveCSS("color", "rgb(255, 127, 80)");

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // Change the transitive dependency — GRID 8→10, coral→blue
    const src = await fsTmp.readFile("base-tokens.ts");
    await fsTmp.writeFile(
      "base-tokens.ts",
      src.replace("GRID = 8", "GRID = 10").replace('"coral"', '"blue"'),
    );

    // GRID * 3 = 30px now
    await expect(box).toHaveCSS("padding", "30px", { timeout: 15_000 });
    await expect(box).toHaveCSS("color", "rgb(0, 0, 255)");

    // Verify no full page reload occurred
    expect(await page.evaluate(() => window.__hmr)).toBe(true);
  }),
);
