import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "styles written for a block element inside <p> apply as written",
  withTestEnv("fold-invalid-nesting", async (testEnv, page) => {
    await page.goto(testEnv.url);

    const box = page.getByTestId("box");
    await expect(box).toHaveText("boxed");
    await expect(box).toHaveCSS("color", "rgb(0, 0, 255)");
    await expect(page.getByTestId("paragraph")).toHaveCSS("color", "rgb(0, 128, 0)");

    // The paragraph styles the box through a component selector — folding
    // must keep the selector matching, exactly as when both render as
    // runtime components
    await expect(box).toHaveCSS("background-color", "rgb(255, 255, 0)");
  }),
);
