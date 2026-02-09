import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR updates when .yak.ts dependency changes",
  withTestEnv("yak-file", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const box = page.getByTestId("box");
    await expect(box).toHaveCSS("padding", "40px");
    await expect(box).toHaveCSS("color", "rgb(0, 128, 128)");

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // Change the .yak.ts file — spacing 40→16, teal→red
    const src = await fsTmp.readFile("tokens.yak.ts");
    await fsTmp.writeFile(
      "tokens.yak.ts",
      src.replace("5 * 8", "2 * 8").replace('"teal"', '"red"'),
    );

    await expect(box).toHaveCSS("padding", "16px", { timeout: 15_000 });
    await expect(box).toHaveCSS("color", "rgb(255, 0, 0)");

    // Verify no full page reload occurred
    expect(await page.evaluate(() => window.__hmr)).toBe(true);
  }),
);
