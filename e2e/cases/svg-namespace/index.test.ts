import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

const SVG = "http://www.w3.org/2000/svg";
const HTML = "http://www.w3.org/1999/xhtml";

test(
  "keeps svg and html namespaces for shared tag names and updates in place",
  withTestEnv("svg-namespace", async (testEnv, page) => {
    await page.goto(testEnv.url);

    const namespace = (id: string) => page.getByTestId(id).evaluate((el) => el.namespaceURI);
    expect(await namespace("icon")).toBe(SVG);
    expect(await namespace("dot")).toBe(SVG);
    expect(await namespace("caption")).toBe(SVG);
    expect(await namespace("inner-link")).toBe(SVG);
    expect(await namespace("outer-link")).toBe(HTML);

    const dot = page.getByTestId("dot");
    await expect(dot).toHaveCSS("fill", "rgb(128, 128, 128)");
    await expect(page.getByTestId("outer-link")).toHaveCSS("color", "rgb(0, 0, 255)");
    await expect(page.getByTestId("icon")).toHaveCSS("width", "24px");

    // Keep the node reference without changing the markup during hydration.
    const originalDot = await dot.elementHandle();
    await expect(async () => {
      await page.getByTestId("outer-link").click();
      await expect(dot).toHaveCSS("fill", "rgb(255, 0, 0)", { timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
    expect(await dot.evaluate((el, original) => el === original, originalDot)).toBe(true);
  }),
);
