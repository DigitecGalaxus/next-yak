import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR: mixed module self-accepts — importer keeps state, imported styled export goes stale",
  withTestEnv("hmr-solid-mixed-module", async (testEnv, page) => {
    await page.goto(testEnv.url);

    const imported = page.getByTestId("imported-badge");
    const inModule = page.getByTestId("in-module-badge");
    const counter = page.getByTestId("counter");
    const increment = page.getByTestId("increment");

    await expect(imported).toHaveAttribute("title", "v1");
    await expect(inModule).toHaveAttribute("title", "v1");

    // State that would be lost if the update bubbled to this module
    await increment.click();
    await expect(counter).toHaveText("1");

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // A JS-shaped edit to the styled export (attrs are plain JS) plus a CSS
    // change that serves as the "update applied" barrier below
    const src = await testEnv.readFile("mixed.tsx");
    await testEnv.writeFile(
      "mixed.tsx",
      src.replace('"v1"', '"v2"').replace("rgb(255, 0, 0)", "rgb(0, 0, 255)"),
    );

    // The new CSS reaches both badges (same generated class, swapped
    // stylesheet) — proof the update was accepted and applied
    await expect(imported).toHaveCSS("color", "rgb(0, 0, 255)", { timeout: 30_000 });
    await expect(inModule).toHaveCSS("color", "rgb(0, 0, 255)");

    // No reload, and the importing component kept its state — the upside of
    // the mixed module accepting the update itself
    expect(await page.evaluate(() => window.__hmr)).toBe(true);
    await expect(counter).toHaveText("1");

    // …and every rendered usage of Badge stays on the old implementation,
    // the in-module one included: the styled export has no solid-refresh
    // registration, and granular patching skips Legend (its own signature is
    // unchanged, and component-typed bindings are not tracked as
    // dependencies), so nothing re-renders with the new Badge.
    await expect(inModule).toHaveAttribute("title", "v1");
    await expect(imported).toHaveAttribute("title", "v1");
  }),
);
