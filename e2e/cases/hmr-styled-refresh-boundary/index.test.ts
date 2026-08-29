import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR: editing styled-only file does not cause full reload when imported through non-boundary chain",
  withTestEnv("hmr-styled-refresh-boundary", async (testEnv, page) => {
    await page.goto(testEnv.url);

    const divider = page.getByTestId("divider");
    const counter = page.getByTestId("counter");
    const increment = page.getByTestId("increment");

    // Verify initial CSS
    await expect(divider).toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(counter).toHaveText("0");

    // Set state that would be lost on full reload. The server-rendered button
    // is clickable before hydration attaches its handler, so on a cold dev
    // server a click can get lost. We retry until someone registers
    await expect(async () => {
      await increment.click();
      await expect(counter).not.toHaveText("0", { timeout: 1000 });
    }).toPass({ timeout: 15_000 });
    const clicks = (await counter.textContent())!;

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // Edit the styled-only file — change CSS color.
    // The import chain is: Divider.tsx → barrel.tsx → pageUtils.ts → index.tsx
    // None of the chain modules can accept an update without losing state:
    //   - barrel.tsx: namespace export (react) / no components (solid)
    //   - pageUtils.ts: mixed exports (react) / no components (solid)
    //   - index.tsx: mixed exports — accepting here re-creates <App />
    // So state survives only when the edit is handled below <App />: a
    // CSS-only edit as a pure virtual-CSS update, and a JS edit (second
    // phase below) by Divider.tsx accepting it as a refresh boundary.
    const src = await testEnv.readFile("Divider.tsx");
    await testEnv.writeFile(
      "Divider.tsx",
      src.replace("background-color: red", "background-color: blue"),
    );

    // Wait for HMR to apply the CSS change
    await expect(divider).toHaveCSS("background-color", "rgb(0, 0, 255)", {
      timeout: 30_000,
    });

    // Verify no full page reload occurred
    expect(await page.evaluate(() => window.__hmr)).toBe(true);

    // Verify component state was preserved (counter didn't reset)
    await expect(counter).toHaveText(clicks);

    // Second edit changes the JS too (a dynamic interpolation), so the module
    // itself must be replaced. On vite a CSS-only edit ships without touching
    // the JS module, so only this edit exercises the refresh-boundary mechanism.
    const src2 = await testEnv.readFile("Divider.tsx");
    await testEnv.writeFile("Divider.tsx", src2.replace("height: 2px", 'height: ${() => "4px"}'));

    await expect(divider).toHaveCSS("height", "4px", { timeout: 30_000 });

    // Still no full reload, and state survives the module replacement
    expect(await page.evaluate(() => window.__hmr)).toBe(true);
    await expect(counter).toHaveText(clicks);
  }),
);

test(
  "HMR: mixed module self-accepts and patches its styled export — importer keeps state",
  withTestEnv("hmr-styled-refresh-boundary", async (testEnv, page) => {
    await page.goto(testEnv.url);

    const imported = page.getByTestId("imported-badge");
    const inModule = page.getByTestId("in-module-badge");
    const counter = page.getByTestId("counter");
    const increment = page.getByTestId("increment");

    await expect(imported).toHaveAttribute("title", "v1");
    await expect(inModule).toHaveAttribute("title", "v1");

    // State that would be lost on a reload or importer re-creation. The
    // server-rendered button is clickable before hydration attaches its
    // handler, so on a cold dev server a click can get lost — retry until
    // one registers.
    await expect(async () => {
      await increment.click();
      await expect(counter).not.toHaveText("0", { timeout: 1000 });
    }).toPass({ timeout: 15_000 });
    const clicks = (await counter.textContent())!;

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

    // No reload, and the importing component kept its state
    expect(await page.evaluate(() => window.__hmr)).toBe(true);
    await expect(counter).toHaveText(clicks);

    // …and every rendered usage of Badge re-renders with the new
    // implementation: the styled export is registered with the framework's
    // refresh runtime (yak's $RefreshReg$ for React; solid registers it from
    // its in-module JSX usage, solidjs/solid#3090), so the edit reaches every
    // usage without re-creating the stateful importer.
    await expect(inModule).toHaveAttribute("title", "v2");
    await expect(imported).toHaveAttribute("title", "v2");
  }),
);
