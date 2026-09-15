import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "passes class, props and a `component` prop to a wrapped component but no $ props",
  withTestEnv("wrapped-component", async (testEnv, page) => {
    await page.goto(testEnv.url);
    const card = page.getByTestId("card");
    await expect(card).toHaveCSS("padding", "12px");
    await expect(card).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(card).toHaveAttribute("data-component", "section");
    const classKey = testEnv.framework === "react" ? "className" : "class";
    const keys = (await card.getAttribute("data-keys"))!.split(",");
    expect(keys).toEqual(expect.arrayContaining(["children", classKey, "component", "title"]));
    expect(keys.filter((key) => key.startsWith("$"))).toEqual([]);
  }),
);

test(
  "a target that merges defaults into its props keeps the generated class and no $ props",
  withTestEnv("wrapped-component", async (testEnv, page) => {
    await page.goto(testEnv.url);
    const classKey = testEnv.framework === "react" ? "className" : "class";
    // plain props, and props that went through a JSX spread
    for (const id of ["merged-plain", "merged-spread"]) {
      const card = page.getByTestId(id);
      await expect(card).toHaveCSS("padding", "12px");
      await expect(card).toHaveCSS("color", "rgb(255, 0, 0)");
      await expect(card).toHaveAttribute("role", "note");
      const keys = (await card.getAttribute("data-keys"))!.split(",");
      expect(keys).toEqual(expect.arrayContaining(["children", classKey, "role", "title"]));
      expect(keys.filter((key) => key.startsWith("$"))).toEqual([]);
    }
  }),
);
