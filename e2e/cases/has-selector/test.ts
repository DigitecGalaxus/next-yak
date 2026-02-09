import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "renders :has() selector — parent reacts to child focus",
  withTestEnv("has-selector", async (fsTmp, page) => {
    await page.goto(fsTmp.url);

    const wrapper = page.getByTestId("wrapper");
    const input = page.getByTestId("input");

    // Before focus — white background
    await expect(wrapper).toHaveCSS("background-color", "rgb(255, 255, 255)");

    // Focus the input — wrapper should turn lightblue
    await input.focus();
    await expect(wrapper).toHaveCSS("background-color", "rgb(173, 216, 230)");

    // Blur — back to white
    await input.blur();
    await expect(wrapper).toHaveCSS("background-color", "rgb(255, 255, 255)");
  }),
);
