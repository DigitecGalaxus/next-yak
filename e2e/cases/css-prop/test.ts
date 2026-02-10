import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders css prop with basic, conditional, and nested styles",
  withTestEnv("css-prop", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    // Basic css prop
    const basic = page.getByTestId("basic");
    await expect(basic).toHaveCSS("padding", "16px");

    // Conditional css prop — the override to green should win
    const conditional = page.getByTestId("conditional");
    await expect(conditional).toHaveCSS("color", "rgb(0, 128, 0)");

    // Nested css prop — parent violet, child green
    const parent = page.getByTestId("parent");
    await expect(parent).toHaveCSS("color", "rgb(238, 130, 238)");
    const child = page.getByTestId("child");
    await expect(child).toHaveCSS("color", "rgb(0, 128, 0)");
  }),
);
