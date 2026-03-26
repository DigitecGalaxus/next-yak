import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR boundary: editing a styled-only file does not cause a full reload",
  withTestEnv("hmr-styled-refresh-boundary", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const section = page.getByTestId("section");
    const counter = page.getByTestId("counter");
    const increment = page.getByTestId("increment");

    // Verify initial CSS
    await expect(section).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(counter).toHaveText("0");

    // Set state that would be lost on full reload
    await increment.click();
    await increment.click();
    await expect(counter).toHaveText("2");

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // Edit the styled-only file — change CSS color
    const src = await fsTmp.readFile("Section.tsx");
    await fsTmp.writeFile(
      "Section.tsx",
      src.replace("color: red", "color: blue"),
    );

    // Wait for HMR to apply the CSS change
    await expect(section).toHaveCSS("color", "rgb(0, 0, 255)", {
      timeout: 30_000,
    });

    // Verify the HMR boundary held — no full reload
    expect(await page.evaluate(() => window.__hmr)).toBe(true);

    // Verify React state was preserved (counter didn't reset)
    await expect(counter).toHaveText("2");
  }),
);
