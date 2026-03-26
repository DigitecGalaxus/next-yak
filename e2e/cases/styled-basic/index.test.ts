import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders styled component with correct CSS",
  withTestEnv("styled-basic", async (fsTmp, page) => {
    await page.goto(fsTmp.url);
    const title = page.getByTestId("title");
    await expect(title).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(title).toHaveCSS("font-size", "24px");
    await expect(title).toHaveText("Hello Yak");
  }),
);
