import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "leaves a module which imports next-yak without styles unchanged",
  withTestEnv("no-style-module", async (testEnv, page) => {
    await page.goto(testEnv.url);

    await expect(page.getByTestId("untouched")).toHaveText("undefined");
    await expect(page.getByTestId("styled")).toHaveCSS("color", "rgb(255, 0, 0)");
  }),
);
