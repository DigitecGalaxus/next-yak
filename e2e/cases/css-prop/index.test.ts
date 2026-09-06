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

    // The server-rendered button is clickable before hydration attaches its
    // handler, so on a cold dev server a click can get lost — retry until
    // one registers.
    await expect(async () => {
      await spreadButton.click();
      await expect(spreadButton).not.toHaveText("clicks: 0", { timeout: 1000 });
    }).toPass({ timeout: 15_000 });

    // sources merge in JSX order: a spread's class joins the css prop's class,
    // and a later source replaces an earlier class attribute
    const spreadClass = page.getByTestId("spread-class");
    await expect(spreadClass).toHaveClass(/from-spread/);
    await expect(spreadClass).toHaveCSS("color", "rgb(0, 0, 255)");
    const laterWins = page.getByTestId("later-wins");
    await expect(laterWins).toHaveClass(/late/);
    await expect(laterWins).not.toHaveClass(/early/);
    await expect(laterWins).toHaveCSS("color", "rgb(0, 0, 255)");

    // a css prop interpolation that reads state updates the same element
    // after the click above
    const live = page.getByTestId("live");
    await expect(live).toHaveCSS("color", "rgb(255, 0, 0)");
    for (const id of ["spread-class", "later-wins", "live", "spread-button"]) {
      await expect(page.getByTestId(id)).not.toHaveAttribute("style", "");
    }
  }),
);
