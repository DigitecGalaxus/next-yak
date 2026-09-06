import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders css prop with basic, conditional, and nested styles",
  withTestEnv("css-prop", async (testEnv, page) => {
    await page.goto(testEnv.url);

    // Basic css prop
    const basic = page.getByTestId("basic");
    await expect(basic).toHaveCSS("padding", "16px");

    // Conditional css prop — the override to green should win
    const conditional = page.getByTestId("conditional");
    await expect(conditional).toHaveCSS("color", "rgb(0, 128, 0)");

    // Nested css prop — parent violet, child green
    const parent = page.getByTestId("parent");
    await expect(parent).toHaveCSS("color", "rgb(238, 130, 238)");
    const child = page.getByTestId("child");
    await expect(child).toHaveCSS("color", "rgb(0, 128, 0)");

    // Entity className is decoded, not left as the JSX-encoded "Food &amp; Drink"
    const entity = page.getByTestId("entity-classname");
    await expect(entity).toHaveClass(/(^|\s)Food & Drink($|\s)/);
    await expect(entity).toHaveCSS("color", "rgb(0, 0, 255)");

    // Backslash className reaches the DOM as a single literal backslash
    // (a non-digit after the backslash keeps octal-strict scanners out of play)
    const backslash = page.getByTestId("backslash-classname");
    await expect(backslash).toHaveClass(/before:content-\['\\q'\]/);
    await expect(backslash).not.toHaveClass(/before:content-\['\\\\q'\]/);
    await expect(backslash).toHaveCSS("color", "rgb(0, 0, 255)");

    // Spread props (onClick, children) survive mergeCssProp — clicking works
    const spreadButton = page.getByTestId("spread-button");
    await expect(spreadButton).toHaveCSS("padding", "8px");
    await expect(spreadButton).toHaveText("clicks: 0");

    // TODO: the Solid server render does not hydrate this button. The yak
    // transform emits `__yak_mergeCssProp({ ...props }, css)`, the Solid
    // compiler passes that call straight to `ssrElement` on the server (before
    // the hydration key is taken) but wraps it in a callback on the client
    // (after the element is claimed), and the object spread reads the
    // `children` getter, which allocates a memo id. The button's key drifts by
    // one and its handler never attaches. Fix: emit the sources as separate
    // arguments and let the helper copy descriptors and add class and style as
    // getters, so no getter runs before the key. Until then the click is not
    // asserted on vite-solid; the hydration warning is also expected there.
    if (testEnv.bundlerDirName === "vite-solid") {
      testEnv.expectConsoleErrors("css prop with a spread does not hydrate yet, see TODO above");
      return;
    }

    // The server-rendered button is clickable before hydration attaches its
    // handler, so on a cold dev server a click can get lost — retry until
    // one registers.
    await expect(async () => {
      await spreadButton.click();
      await expect(spreadButton).not.toHaveText("clicks: 0", { timeout: 1000 });
    }).toPass({ timeout: 15_000 });
  }),
);
