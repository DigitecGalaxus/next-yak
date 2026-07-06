import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders and toggles a dynamic cross-file mixin",
  withTestEnv("dynamic-cross-file-mixin", async (testEnv, page) => {
    await page.goto(testEnv.url);

    const item = page.getByTestId("item");
    // consumer css
    await expect(item).toHaveCSS("margin", "0px");
    // static part of the mixin (spliced at build time)
    await expect(item).toHaveCSS("font-style", "italic");
    // css variable value from the mixin (set at runtime through the style attribute)
    await expect(item).toHaveCSS("padding-left", "12px");
    // branch is off initially
    await expect(item).toHaveCSS("color", "rgb(0, 0, 0)");
    await expect(item).toHaveCSS("text-decoration-line", "none");

    // the keyframe referenced inside the mixin must ship with the consumer
    // even though the producer module exports nothing else (issue #419)
    const animationName = await item.evaluate(
      (element) => getComputedStyle(element).animationName,
    );
    expect(animationName).not.toBe("none");
    const keyframesDefined = await page.evaluate((name) => {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            if (rule instanceof CSSKeyframesRule && rule.name === name) {
              return true;
            }
          }
        } catch {
          // cross-origin stylesheets can not be inspected
        }
      }
      return false;
    }, animationName);
    expect(keyframesDefined).toBe(true);

    // toggling the prop applies the conditional branch
    await page.getByTestId("toggle").click();
    await expect(item).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(item).toHaveCSS("text-decoration-line", "underline");
    // static parts stay applied
    await expect(item).toHaveCSS("font-style", "italic");

    // and toggling back removes it again
    await page.getByTestId("toggle").click();
    await expect(item).toHaveCSS("color", "rgb(0, 0, 0)");
    await expect(item).toHaveCSS("text-decoration-line", "none");
  }),
);
