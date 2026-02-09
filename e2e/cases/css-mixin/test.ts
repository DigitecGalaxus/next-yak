import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders css mixin in styled component and css prop",
  withTestEnv("css-mixin", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    // Mixin used inside styled component
    const styledMixin = page.getByTestId("styled-mixin");
    await expect(styledMixin).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(styledMixin).toHaveCSS("font-size", "20px");

    // Mixin used inside css prop
    const cssPropMixin = page.getByTestId("css-prop-mixin");
    await expect(cssPropMixin).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(cssPropMixin).toHaveCSS("font-size", "16px");
  }),
);
