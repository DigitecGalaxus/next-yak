import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR recovers after a syntax error in a .yak.ts dependency",
  withTestEnv("hmr-yak-syntax-error-recovery", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const box = page.getByTestId("box");
    await expect(box).toHaveCSS("padding", "40px");
    await expect(box).toHaveCSS("color", "rgb(0, 128, 128)");

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // Introduce a syntax error in the .yak.ts file
    await fsTmp.writeFile(
      "tokens.yak.ts",
      "export const spacing = 5 * 8;\nexport const brand = <<<BROKEN>>>;\n",
    );

    // Wait for the error to propagate
    await page.waitForTimeout(3_000);

    // Fix the syntax error with new values
    await fsTmp.writeFile(
      "tokens.yak.ts",
      'export const spacing = 2 * 8;\nexport const brand = "red";\n',
    );

    // After recovery, the new values should be applied
    await expect(box).toHaveCSS("padding", "16px", { timeout: 15_000 });
    await expect(box).toHaveCSS("color", "rgb(255, 0, 0)");

    // Verify no full page reload occurred
    expect(await page.evaluate(() => window.__hmr)).toBe(true);
  }),
);
