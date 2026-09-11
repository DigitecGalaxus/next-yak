import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "provides the theme to style and attrs functions without leaking it",
  withTestEnv("theme", async (testEnv, page) => {
    await page.goto(testEnv.url);
    const panel = page.getByTestId("panel");
    await expect(panel).toHaveCSS("color", "rgb(0, 128, 0)");
    await expect(panel).toHaveAttribute("title", "dark");
    await expect(panel).not.toHaveAttribute("theme");
  }),
);
