import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders css prop with basic, conditional, and nested styles",
  withTestEnv("css-prop", async (testEnv, page) => {
    await page.goto(testEnv.url);

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

    // Entity className is decoded, not left as the JSX-encoded "Food &amp; Drink"
    const entity = page.getByTestId("entity-classname");
    await expect(entity).toHaveClass(/(^|\s)Food & Drink($|\s)/);
    await expect(entity).toHaveCSS("color", "rgb(0, 0, 255)");

    // Backslash className must reach the DOM as a single literal backslash
    const backslash = page.getByTestId("backslash-classname");
    await expect(backslash).toHaveClass(/before:content-\['\\2713'\]/);
    await expect(backslash).toHaveCSS("color", "rgb(0, 0, 255)");

    // Spread props (onClick, children) survive mergeCssProp — clicking works
    const spreadButton = page.getByTestId("spread-button");
    await expect(spreadButton).toHaveCSS("padding", "8px");
    await expect(spreadButton).toHaveText("clicks: 0");
    await spreadButton.click();
    await expect(spreadButton).toHaveText("clicks: 1");
  }),
);
