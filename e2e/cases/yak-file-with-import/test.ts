import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR updates when shared base dependency changes across multiple component files",
  withTestEnv("yak-file-with-import", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const accordion = page.getByTestId("accordion");
    const button = page.getByTestId("button");
    const card = page.getByTestId("card");

    // Initial: GRID*3=24px, brandColor=coral
    await expect(accordion).toHaveCSS("padding", "24px");
    await expect(button).toHaveCSS("padding", "24px");
    await expect(button).toHaveCSS("color", "rgb(255, 127, 80)");
    await expect(card).toHaveCSS("color", "rgb(255, 127, 80)");

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // Change the shared dependency — all components should update
    const src = await fsTmp.readFile("base-tokens.ts");
    await fsTmp.writeFile(
      "base-tokens.ts",
      src.replace("GRID = 8", "GRID = 10").replace('"coral"', '"blue"'),
    );

    // Accordion: spacing only (30px)
    await expect(accordion).toHaveCSS("padding", "30px", { timeout: 15_000 });
    // Button: both spacing + color
    await expect(button).toHaveCSS("padding", "30px");
    await expect(button).toHaveCSS("color", "rgb(0, 0, 255)");
    // Card: color only
    await expect(card).toHaveCSS("color", "rgb(0, 0, 255)");

    // Verify no full page reload occurred
    expect(await page.evaluate(() => window.__hmr)).toBe(true);
  }),
);
