import { expect, test } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "updates spread keys, attrs children, and forwarded props",
  withTestEnv("reactive-props", async (testEnv, page) => {
    await page.goto(testEnv.url);
    const spread = page.getByTestId("spread");
    const children = page.getByTestId("children");
    const forwarded = page.getByTestId("forwarded");
    const toggle = page.getByTestId("toggle");

    await expect(spread).not.toHaveAttribute("data-label");
    await expect(children).toBeEmpty();
    await expect(page.getByTestId("attrs")).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(forwarded).toHaveAttribute("data-label", "first");
    await expect(page.getByTestId("static")).toHaveText("<b>&text");
    await expect(page.getByTestId("static").locator("b")).toHaveCount(0);

    await expect(async () => {
      await toggle.click();
      await expect(toggle).toHaveText("on", { timeout: 1000 });
    }).toPass({ timeout: 15_000 });
    await expect(spread).toHaveAttribute("data-label", "ready");
    await expect(children).toHaveText("ready");
    await expect(forwarded).toHaveAttribute("data-label", "second");

    await toggle.click();
    await expect(toggle).toHaveText("off");
    await expect(spread).not.toHaveAttribute("data-label");
    await expect(children).toBeEmpty();
    await expect(forwarded).toHaveAttribute("data-label", "first");
  }),
);
