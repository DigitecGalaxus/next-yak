import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders styled component with cross-file css mixin",
  withTestEnv("cross-file-mixin", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const item = page.getByTestId("item");
    await expect(item).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(item).toHaveCSS("margin-bottom", "10px");
    // From the imported mixin
    await expect(item).toHaveCSS("font-weight", "700");
    await expect(item).toHaveCSS("text-decoration-line", "underline");
  }),
);
