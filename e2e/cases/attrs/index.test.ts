import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders .attrs() with default attributes and prop overrides",
  withTestEnv("attrs", async (testEnv, page) => {
    await page.goto(testEnv.url);

    // Static attrs: type="button"
    const button = page.getByTestId("button");
    await expect(button).toHaveAttribute("type", "button");
    await expect(button).toHaveCSS("color", "rgb(255, 0, 0)");

    // Dynamic attrs with default $size
    const input = page.getByTestId("input");
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveCSS("padding", "16px"); // 1rem = 16px
    await expect(input).toHaveCSS("border-color", "rgb(0, 0, 255)");

    // Dynamic attrs with overridden $size
    const inputCustom = page.getByTestId("input-custom");
    await expect(inputCustom).toHaveCSS("padding", "32px"); // 2rem = 32px

    // Composed attrs: type overridden to "password"
    const password = page.getByTestId("password");
    await expect(password).toHaveAttribute("type", "password");
    await expect(password).toHaveCSS("border-color", "rgb(0, 128, 0)");
  }),
);

test(
  "two attrs layers keep both attribute sets and render a child once",
  withTestEnv("attrs", async (testEnv, page) => {
    const html = await (await page.request.get(testEnv.url)).text();
    await page.goto(testEnv.url);
    const fancy = page.getByTestId("fancy");
    await expect(fancy).toHaveAttribute("type", "button");
    await expect(fancy).toHaveAttribute("data-fancy", "1");
    await expect(fancy).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(fancy).toHaveCSS("border-color", "rgb(0, 0, 255)");
    // boolean and number attrs values
    const baked = page.getByTestId("baked");
    await expect(baked).toHaveAttribute("type", "button");
    await expect(baked).toHaveAttribute("disabled", "");
    await expect(baked).toHaveAttribute("tabindex", "0");
    await expect(baked).toHaveCSS("color", "rgb(0, 128, 0)");
    // the server wrote the textarea value as content
    await expect(page.getByTestId("note")).toHaveValue("preset");
    await expect(page.getByTestId("note")).toHaveCSS("color", "rgb(0, 0, 255)");
    // a fresh mount applies defaultValue as a property, not as a dead attribute
    await page.getByTestId("mount-input").click();
    await expect(page.getByTestId("preset-input")).toHaveValue("preset");
    // the server rendered the child once, and so did the client. React's
    // strict mode double-invokes renders in dev, so the count holds for the
    // other frameworks only
    if (testEnv.framework !== "react") {
      expect(html).toMatch(/data-testid="child-renders"[^>]*>1</);
      await expect(page.getByTestId("child-renders")).toHaveText("1");
    }
  }),
);
