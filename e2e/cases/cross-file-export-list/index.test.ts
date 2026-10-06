import { test, expect } from "@playwright/test";
import { withTestEnv } from "yak-e2e";

test(
  "renders a mixin and a styled component exported with a local export list",
  withTestEnv("cross-file-export-list", async (testEnv, page) => {
    await page.goto(testEnv.url);

    // From the mixin in `export { outlined }`
    const box = page.getByTestId("box");
    await expect(box).toHaveCSS("outline-style", "solid");
    await expect(box).toHaveCSS("outline-width", "3px");
    await expect(box).toHaveCSS("outline-color", "rgb(255, 0, 0)");

    // From the selector of the component in `export { Title as Heading }`
    const heading = page.getByTestId("heading");
    await expect(heading).toHaveCSS("color", "rgb(0, 128, 0)");
    await expect(heading).toHaveCSS("font-size", "20px");
  }),
);
