import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders ::before and ::after pseudo-elements with content",
  withTestEnv("pseudo-elements", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const badge = page.getByTestId("badge");

    // ::before with content "["
    const beforeContent = await badge.evaluate(
      (el) => getComputedStyle(el, "::before").content,
    );
    expect(beforeContent).toBe('"["');

    const beforeColor = await badge.evaluate(
      (el) => getComputedStyle(el, "::before").color,
    );
    expect(beforeColor).toBe("rgb(255, 0, 0)");

    // ::after with content "]"
    const afterContent = await badge.evaluate(
      (el) => getComputedStyle(el, "::after").content,
    );
    expect(afterContent).toBe('"]"');

    const afterColor = await badge.evaluate(
      (el) => getComputedStyle(el, "::after").color,
    );
    expect(afterColor).toBe("rgb(0, 0, 255)");

    // Decorative ::after with empty content and visible styles
    const underline = page.getByTestId("underline");
    const afterBg = await underline.evaluate(
      (el) => getComputedStyle(el, "::after").backgroundColor,
    );
    expect(afterBg).toBe("rgb(0, 128, 0)");
  }),
);
