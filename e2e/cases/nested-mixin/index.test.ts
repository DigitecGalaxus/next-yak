import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders nested cross-file mixins with component selectors",
  withTestEnv("nested-mixin", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    // Button gets buttonMixin: color black
    const button = page.getByTestId("button");
    await expect(button).toHaveCSS("color", "rgb(0, 0, 0)");

    // Icon inside Button gets buttonTextMixin via ${Icon} selector
    const buttonIcon = page.getByTestId("button-icon");
    await expect(buttonIcon).toHaveCSS("display", "inline-block");
    await expect(buttonIcon).toHaveCSS("width", "20px");
    await expect(buttonIcon).toHaveCSS("color", "rgb(0, 0, 0)");

    // PrimaryButton: buttonMixin + color green override + typography.h1
    const primaryButton = page.getByTestId("primary-button");
    await expect(primaryButton).toHaveCSS("color", "rgb(0, 128, 0)");
    await expect(primaryButton).toHaveCSS("font-size", "16px");
    await expect(primaryButton).toHaveCSS("font-weight", "400");
  }),
);
