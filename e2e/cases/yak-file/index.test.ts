import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders .yak.ts tokens with correct CSS",
  withTestEnv("yak-file", async (testEnv, page) => {
    await page.goto(testEnv.url);

    const box = page.getByTestId("box");
    await expect(box).toHaveCSS("padding", "40px");
    await expect(box).toHaveCSS("color", "rgb(0, 128, 128)");
  }),
);
