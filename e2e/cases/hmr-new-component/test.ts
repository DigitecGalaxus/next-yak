import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "HMR adds a new styled component without full reload",
  withTestEnv("hmr-new-component", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const first = page.getByTestId("first");
    await expect(first).toHaveCSS("color", "rgb(255, 0, 0)");

    // Set marker to detect full page reloads
    await page.evaluate(() => {
      window.__hmr = true;
    });

    // Add a second styled component via HMR
    await fsTmp.writeFile(
      "App.tsx",
      `import { styled } from "next-yak";

const First = styled.div\`
  color: red;
\`;

const Second = styled.div\`
  color: blue;
\`;

export default function App() {
  return (
    <div>
      <First data-testid="first">First</First>
      <Second data-testid="second">Second</Second>
    </div>
  );
}
`,
    );

    // Wait for the new component to appear
    const second = page.getByTestId("second");
    await expect(second).toBeVisible({ timeout: 15_000 });
    await expect(second).toHaveCSS("color", "rgb(0, 0, 255)");

    // First component should still be styled
    await expect(first).toHaveCSS("color", "rgb(255, 0, 0)");

    // Verify no full page reload occurred
    expect(await page.evaluate(() => window.__hmr)).toBe(true);
  }),
);
