import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR: styled exports preserve importer state across CSS and JS edits",
  withTestEnv("hmr-styled-refresh-boundary", async (testEnv, page) => {
    // Keep the edits in one session so no page loads during file restoration.
    await page.goto(testEnv.url);

    const divider = page.getByTestId("divider");
    const imported = page.getByTestId("imported-badge");
    const inModule = page.getByTestId("in-module-badge");
    const counter = page.getByTestId("counter");
    const increment = page.getByTestId("increment");

    await expect(divider).toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(imported).toHaveAttribute("title", "v1");
    await expect(inModule).toHaveAttribute("title", "v1");
    await expect(counter).toHaveText("0");

    // Retry clicks until hydration attaches the handler.
    await expect(async () => {
      await increment.click();
      await expect(counter).not.toHaveText("0", { timeout: 1000 });
    }).toPass({ timeout: 15_000 });
    const clicks = (await counter.textContent())!;
    await page.evaluate(() => {
      window.__hmr = true;
    });

    await test.step("styled-only module accepts CSS and JS edits through a non-boundary import chain", async () => {
      // Divider.tsx → barrel.tsx → pageUtils.ts → index.tsx. Accepting an
      // update in the importer recreates App and resets its counter.
      const src = await testEnv.readFile("Divider.tsx");
      await testEnv.writeFile(
        "Divider.tsx",
        src.replace("background-color: red", "background-color: blue"),
      );
      await expect(divider).toHaveCSS("background-color", "rgb(0, 0, 255)", {
        timeout: 30_000,
      });
      expect(await page.evaluate(() => window.__hmr)).toBe(true);
      await expect(counter).toHaveText(clicks);

      // Chokidar drops a second change event within 50 ms.
      await page.waitForTimeout(200);
      const src2 = await testEnv.readFile("Divider.tsx");
      await testEnv.writeFile("Divider.tsx", src2.replace("height: 2px", 'height: ${() => "4px"}'));

      // A dynamic interpolation changes the JS, so CSS-only HMR cannot
      // satisfy this check: the styled module must accept the update.
      await expect(divider).toHaveCSS("height", "4px", { timeout: 30_000 });
      expect(await page.evaluate(() => window.__hmr)).toBe(true);
      await expect(counter).toHaveText(clicks);
    });

    await test.step("mixed module patches both local and imported uses of its styled export", async () => {
      const src = await testEnv.readFile("mixed.tsx");
      await testEnv.writeFile(
        "mixed.tsx",
        src.replace('"v1"', '"v2"').replace("rgb(255, 0, 0)", "rgb(0, 0, 255)"),
      );
      await expect(imported).toHaveCSS("color", "rgb(0, 0, 255)", { timeout: 30_000 });
      await expect(inModule).toHaveCSS("color", "rgb(0, 0, 255)");
      expect(await page.evaluate(() => window.__hmr)).toBe(true);
      await expect(counter).toHaveText(clicks);
      await expect(inModule).toHaveAttribute("title", "v2");
      await expect(imported).toHaveAttribute("title", "v2");
    });
  }),
);
