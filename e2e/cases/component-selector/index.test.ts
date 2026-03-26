import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders component selector targeting imported styled component",
  withTestEnv("component-selector", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    // Icon has its own styles
    const icon = page.getByTestId("icon");
    await expect(icon).toHaveCSS("width", "32px");
    await expect(icon).toHaveCSS("height", "32px");

    // Icon inside Button gets the selector-targeted margin
    await expect(icon).toHaveCSS("margin-right", "10px");
  }),
);
