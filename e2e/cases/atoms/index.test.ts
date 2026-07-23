import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

const atomClasses = async (page: import("@playwright/test").Page, testId: string) =>
  ((await page.getByTestId(testId).getAttribute("class")) ?? "")
    .split(" ")
    .filter((className) => className.startsWith("bg-") || className.startsWith("text-"));

test(
  "renders atom classes and applies them",
  withTestEnv("atoms", async (testEnv, page) => {
    await page.goto(testEnv.url);

    // one multi class string and separate atoms must emit the same classes
    expect(await atomClasses(page, "joined")).toEqual(["bg-blue", "text-white"]);
    expect(await atomClasses(page, "separate")).toEqual(["bg-blue", "text-white"]);

    const joined = page.getByTestId("joined");
    await expect(joined).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(joined).toHaveCSS("color", "rgb(255, 255, 255)");

    // atoms in a dynamic interpolation still resolve per props
    expect(await atomClasses(page, "conditional-active")).toEqual(["bg-blue", "text-white"]);
    expect(await atomClasses(page, "conditional-inactive")).toEqual(["bg-blue"]);
    await expect(page.getByTestId("conditional-inactive")).toHaveCSS("color", "rgb(0, 0, 0)");
  }),
);
