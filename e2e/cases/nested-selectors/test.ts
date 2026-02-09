import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders nested selectors including child and hover",
  withTestEnv("nested-selectors", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const container = page.getByTestId("container");
    const inner = page.getByTestId("inner");

    // Child selector: & > span { font-weight: bold }
    await expect(inner).toHaveCSS("font-weight", "700");

    // Before hover
    await expect(container).toHaveCSS("color", "rgb(0, 0, 0)");

    // After hover
    await container.hover();
    await expect(container).toHaveCSS("color", "rgb(0, 0, 255)");
  }),
);
