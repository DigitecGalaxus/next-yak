import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "globalStyles applies a plain element selector to body",
  withTestEnv("global-styles", async (testEnv, page) => {
    await page.goto(testEnv.url);
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(1, 2, 3)");
  }),
);

test(
  "globalStyles declares a custom property on :root consumed by a component",
  withTestEnv("global-styles", async (testEnv, page) => {
    await page.goto(testEnv.url);
    await expect(page.getByTestId("width-consumer")).toHaveCSS("width", "123px");
  }),
);

test(
  "globalStyles can reference a keyframes animation",
  withTestEnv("global-styles", async (testEnv, page) => {
    await page.goto(testEnv.url);
    const animated = page.getByTestId("animated-box");
    await expect(animated).toHaveCSS("animation-duration", "1s");
    // The animation-name must resolve to the generated keyframe (not "none")
    await expect(animated).not.toHaveCSS("animation-name", "none");
  }),
);

test(
  "globalStyles can target a component selector inside :has()",
  withTestEnv("global-styles", async (testEnv, page) => {
    await page.goto(testEnv.url);
    // body:has(<OpenTrigger data-open="true">) { overflow: hidden }
    await expect(page.locator("body")).toHaveCSS("overflow-x", "hidden");
  }),
);

test(
  "unlayered globals win over component styles through regular specificity",
  withTestEnv("global-styles", async (testEnv, page) => {
    await page.goto(testEnv.url);
    const input = page.getByTestId("focus-input");
    // Blurred: only the component rule applies → black.
    await expect(input).toHaveCSS("color", "rgb(0, 0, 0)");
    // Focused: global `input:focus-visible` (0-1-1) beats the component
    // class (0-1-0) — the state-scoped global rule wins, as it would with a
    // plain global stylesheet. Text inputs match :focus-visible on any focus.
    await input.focus();
    await expect(input).toHaveCSS("color", "rgb(255, 165, 0)");
  }),
);

test(
  "user-authored @layer opts globals out of specificity fights with components",
  withTestEnv("global-styles", async (testEnv, page) => {
    await page.goto(testEnv.url);
    // The global rule inside `@layer base` sets red at the same specificity as
    // the component rule, but unlayered (component) beats layered → green wins
    // regardless of source order.
    await expect(page.getByTestId("layer-box")).toHaveCSS("color", "rgb(0, 128, 0)");
  }),
);
