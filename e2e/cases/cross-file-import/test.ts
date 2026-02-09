import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR updates when cross-file dependency changes",
  withTestEnv("cross-file-import", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const primary = page.getByTestId("primary");
    await expect(primary).toHaveCSS("color", "rgb(128, 0, 128)");

    const orange = page.getByTestId("orange");
    await expect(orange).toHaveCSS("color", "rgb(255, 165, 0)");

    const defaultBox = page.getByTestId("default");
    await expect(defaultBox).toHaveCSS("color", "rgb(0, 128, 128)");

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // Change the dependency file — purple → red, orange → blue, teal → green
    const src = await fsTmp.readFile("colors.ts");
    await fsTmp.writeFile(
      "colors.ts",
      src
        .replace('"purple"', '"red"')
        .replace('"orange"', '"blue"')
        .replace('"teal"', '"green"'),
    );

    await expect(primary).toHaveCSS("color", "rgb(255, 0, 0)", {
      timeout: 15_000,
    });
    await expect(orange).toHaveCSS("color", "rgb(0, 0, 255)");
    await expect(defaultBox).toHaveCSS("color", "rgb(0, 128, 0)");

    // Verify no full page reload occurred
    expect(await page.evaluate(() => window.__hmr)).toBe(true);
  }),
);
