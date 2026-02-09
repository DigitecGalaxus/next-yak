import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders styled composition with inherited and overridden styles",
  withTestEnv("styled-composition", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const base = page.getByTestId("base");
    await expect(base).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(base).toHaveCSS("padding", "8px");
    await expect(base).toHaveCSS("font-weight", "400");

    const extended = page.getByTestId("extended");
    // Inherited from Base
    await expect(extended).toHaveCSS("color", "rgb(255, 0, 0)");
    // Overridden by Extended
    await expect(extended).toHaveCSS("padding", "16px");
    await expect(extended).toHaveCSS("font-weight", "700");
  }),
);
