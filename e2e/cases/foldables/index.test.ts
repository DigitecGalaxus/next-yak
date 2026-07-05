import { test, expect } from "@playwright/test";
import { withTestEnv } from "next-yak-e2e";

test(
  "folded styled component usages render like the runtime path",
  withTestEnv("foldables", async (testEnv, page) => {
    await page.goto(testEnv.url);

    // fully static fold
    await expect(page.getByTestId("static")).toHaveCSS("color", "rgb(0, 128, 0)");

    // static styled(Component) fold keeps both classes
    const extended = page.getByTestId("extended");
    await expect(extended).toHaveCSS("color", "rgb(0, 128, 0)");
    await expect(extended).toHaveCSS("background-color", "rgb(255, 255, 0)");

    // inlined class-toggling conditions
    await expect(page.getByTestId("toggle-on")).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(page.getByTestId("toggle-off")).toHaveCSS("color", "rgb(0, 0, 255)");

    // $props never reach the DOM - dropped at compile time when folded
    await expect(page.getByTestId("toggle-on")).not.toHaveAttribute("$active");

    // a spread keeps the runtime path - it must render like the folded twin
    const runtime = page.getByTestId("toggle-runtime");
    await expect(runtime).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(runtime).not.toHaveAttribute("$active");

    // the inlined condition stays reactive
    const stateDriven = page.getByTestId("toggle-state");
    await expect(stateDriven).toHaveCSS("color", "rgb(0, 0, 255)");
    await page.getByTestId("activate").click();
    await expect(stateDriven).toHaveCSS("color", "rgb(255, 0, 0)");

    // a folded css prop class merges into the inlined className
    const merged = page.getByTestId("merged");
    await expect(merged).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(merged).toHaveCSS("text-decoration-line", "underline");

    // ternary mixins - explicit and absent $prop branch
    await expect(page.getByTestId("tone-primary")).toHaveCSS("color", "rgb(128, 0, 128)");
    await expect(page.getByTestId("tone-default")).toHaveCSS("color", "rgb(255, 165, 0)");

    // non-$ props stay on the element and toggle classes
    await expect(page.getByTestId("enabled")).toHaveCSS("color", "rgb(0, 128, 128)");
    const disabled = page.getByTestId("disabled");
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveCSS("color", "rgb(0, 0, 0)");
  }),
);
