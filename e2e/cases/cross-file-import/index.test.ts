import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders cross-file imported constants with correct CSS",
  withTestEnv("cross-file-import", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const primary = page.getByTestId("primary");
    await expect(primary).toHaveCSS("color", "rgb(128, 0, 128)");

    const orange = page.getByTestId("orange");
    await expect(orange).toHaveCSS("color", "rgb(255, 165, 0)");

    const defaultBox = page.getByTestId("default");
    await expect(defaultBox).toHaveCSS("color", "rgb(0, 128, 128)");
  }),
);
