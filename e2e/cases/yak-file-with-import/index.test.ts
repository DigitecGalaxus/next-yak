import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders shared .yak.ts tokens across multiple components with correct CSS",
  withTestEnv("yak-file-with-import", async (testEnv, page) => {
    await page.goto(testEnv.url);

    const accordion = page.getByTestId("accordion");
    const button = page.getByTestId("button");
    const card = page.getByTestId("card");

    // GRID*3=24px, brandColor=coral
    await expect(accordion).toHaveCSS("padding", "24px");
    await expect(button).toHaveCSS("padding", "24px");
    await expect(button).toHaveCSS("color", "rgb(255, 127, 80)");
    await expect(card).toHaveCSS("color", "rgb(255, 127, 80)");
  }),
);
