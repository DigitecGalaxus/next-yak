import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders keyframes animation",
  withTestEnv("keyframes-animation", async (fsTmp, page) => {
    await page.goto(fsTmp.url);
    const box = page.getByTestId("box");

    // With reverse direction on a 100s animation, the box should start near 1000px
    await expect(async () => {
      const left = await box.evaluate((el) => el.getBoundingClientRect().left);
      expect(left).toBeGreaterThan(900);
    }).toPass({ timeout: 5000 });
  }),
);
