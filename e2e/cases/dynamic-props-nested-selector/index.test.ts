import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "inherits dynamic-prop CSS variables into descendant selectors",
  withTestEnv("dynamic-props-nested-selector", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    // The CSS variable is set on the styled parent's inline style but
    // consumed by a plain child element via a descendant selector — each
    // instance's value must be inherited by its own children.
    await expect(page.getByTestId("button-32")).toHaveCSS("left", "32px");
    await expect(page.getByTestId("button-64")).toHaveCSS("left", "64px");

    // Same inheritance dependency via a component selector (${Icon} { ... })
    await expect(page.getByTestId("icon")).toHaveCSS("width", "24px");
  }),
);
