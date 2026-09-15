import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR adds a new styled component without full reload",
  withTestEnv("hmr-new-component", async (testEnv, page) => {
    await page.goto(testEnv.url);

    const first = page.getByTestId("first");
    await expect(first).toHaveCSS("color", "rgb(255, 0, 0)");

    // The server can provide CSS before the client registers its HMR handlers.
    const ready = page.getByTestId("ready");
    await expect(async () => {
      await ready.click();
      await expect(ready).toHaveText("Ready", { timeout: 1000 });
    }).toPass({ timeout: 15_000 });

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // Add a second styled component via HMR (the JSX below is framework-neutral;
    // the import source differs per framework, and qwik's app root is a component$
    // so its hmr has a boundary to re-render)
    const qwik = testEnv.framework === "qwik";
    const yakPackage = { react: "next-yak", solid: "@yak/solid", qwik: "@yak/qwik" }[
      testEnv.framework
    ];
    await testEnv.writeFile(
      "index.tsx",
      `${qwik ? 'import { component$ } from "@qwik.dev/core";\n' : ""}import { styled } from "${yakPackage}";

const First = styled.div\`
  color: red;
\`;

const Second = styled.div\`
  color: blue;
\`;

export default ${qwik ? "component$(() => {" : "function App() {"}
  return (
    <div>
      <First data-testid="first">First</First>
      <Second data-testid="second">Second</Second>
    </div>
  );
}${qwik ? ")" : ""}
`,
    );

    // Wait for the new component to appear
    const second = page.getByTestId("second");
    await expect(second).toBeVisible({ timeout: 30_000 });
    await expect(second).toHaveCSS("color", "rgb(0, 0, 255)");

    // First component should still be styled
    await expect(first).toHaveCSS("color", "rgb(255, 0, 0)");

    // Verify no full page reload occurred
    expect(await page.evaluate(() => window.__hmr)).toBe(true);
  }),
);
