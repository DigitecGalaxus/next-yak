import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders @layer with correct specificity — unlayered wins",
  withTestEnv("layer", async (testEnv, page) => {
    await page.goto(testEnv.url);

    const box = page.getByTestId("box");
    // Unlayered `color: blue` should beat `@layer base { color: red }`
    await expect(box).toHaveCSS("color", "rgb(0, 0, 255)");
  }),
);
