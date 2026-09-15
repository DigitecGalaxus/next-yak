import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "switches extracted CSS classes when the theme changes",
  withTestEnv("theme", async (testEnv, page) => {
    await page.goto(testEnv.url);
    const panel = page.getByTestId("panel");
    await expect(panel).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(panel).toHaveAttribute("title", "brandA");
    await expect(panel).not.toHaveAttribute("theme");
    await expect(panel).not.toHaveAttribute("style");
    const brandAClass = await panel.getAttribute("class");

    await expect(async () => {
      await page.getByTestId("toggle-brand").click();
      await expect(panel).toHaveAttribute("title", "brandB", { timeout: 1000 });
    }).toPass({ timeout: 15_000 });
    await expect(panel).toHaveCSS("color", "rgb(0, 0, 255)");
    await expect(panel).not.toHaveAttribute("class", brandAClass!);
    await expect(panel).not.toHaveAttribute("theme");
    await expect(panel).not.toHaveAttribute("style");

    await page.getByTestId("toggle-brand").click();
    await expect(panel).toHaveAttribute("title", "brandA");
    await expect(panel).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(panel).toHaveAttribute("class", brandAClass!);
  }),
);
