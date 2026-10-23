import { test, expect } from "@playwright/test";
import { withTestEnv } from "yak-e2e";

test(
  "renders cross-file imported constants with correct CSS",
  withTestEnv("cross-file-import", async (testEnv, page) => {
    await page.goto(testEnv.url);

    const primary = page.getByTestId("primary");
    await expect(primary).toHaveCSS("color", "rgb(128, 0, 128)");

    const orange = page.getByTestId("orange");
    await expect(orange).toHaveCSS("color", "rgb(255, 165, 0)");

    const defaultBox = page.getByTestId("default");
    await expect(defaultBox).toHaveCSS("color", "rgb(0, 128, 128)");

    // template literal constants built from other constants
    await expect(page.getByTestId("negative-gap")).toHaveCSS("margin-left", "-20px");
    await expect(page.getByTestId("half-negative-space")).toHaveCSS("margin-left", "-10px");
    await expect(page.getByTestId("local-negative-gap")).toHaveCSS("margin-left", "-30px");
  }),
);
