import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders media queries — inline and from cross-file constant",
  withTestEnv("media-query", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const title = page.getByTestId("title");
    const mobileHidden = page.getByTestId("mobile-hidden");

    // Wide viewport (default 1280px) — font-size should be 24px, element visible
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(title).toHaveCSS("font-size", "24px");
    await expect(mobileHidden).toBeVisible();

    // Narrow viewport — font-size back to 16px, element hidden
    await page.setViewportSize({ width: 500, height: 720 });
    await expect(title).toHaveCSS("font-size", "16px");
    await expect(mobileHidden).not.toBeVisible();
  }),
);
