import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders dynamic props with CSS variables and conditional styles",
  withTestEnv("dynamic-props", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const active = page.getByTestId("bar-active");
    await expect(active).toHaveCSS("width", "200px");
    await expect(active).toHaveCSS("background-color", "rgb(0, 128, 0)");

    const inactive = page.getByTestId("bar-inactive");
    await expect(inactive).toHaveCSS("width", "100px");
    await expect(inactive).toHaveCSS("background-color", "rgb(128, 128, 128)");
  }),
);
