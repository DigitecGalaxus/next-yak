import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders styled components with dynamically generated yak file mixins",
  withTestEnv("yak-file-mixin", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    // h1: font-size 16px (16 - 0*2)
    const headline = page.getByTestId("headline");
    await expect(headline).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(headline).toHaveCSS("font-size", "16px");
    await expect(headline).toHaveCSS("font-weight", "400");

    // h3: font-size 12px (16 - 2*2)
    const subheading = page.getByTestId("subheading");
    await expect(subheading).toHaveCSS("color", "rgb(0, 0, 255)");
    await expect(subheading).toHaveCSS("font-size", "12px");
    await expect(subheading).toHaveCSS("font-weight", "400");
  }),
);
