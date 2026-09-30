import { test, expect } from "@playwright/test";
import { withTestEnv } from "yak-e2e";

test(
  "leaves a module which imports @yak/react without styles unchanged",
  withTestEnv("no-style-module", async (testEnv, page) => {
    await page.goto(testEnv.url);

    await expect(page.getByTestId("untouched")).toHaveText("undefined");
    await expect(page.getByTestId("styled")).toHaveCSS("color", "rgb(255, 0, 0)");
  }),
);
