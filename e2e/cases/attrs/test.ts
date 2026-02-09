import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders .attrs() with default attributes and prop overrides",
  withTestEnv("attrs", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

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
