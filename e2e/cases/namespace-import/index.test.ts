import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders styled component with namespace-imported constants",
  withTestEnv("namespace-import", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const button = page.getByTestId("button");
    await expect(button).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(button).toHaveCSS("background-color", "rgb(0, 0, 255)");
  }),
);
