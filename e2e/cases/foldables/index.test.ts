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

    // a three-level chain keeps every level's style
    const chain = page.getByTestId("chain");
    await expect(chain).toHaveCSS("color", "rgb(0, 0, 139)");
    await expect(chain).toHaveCSS("background-color", "rgb(173, 216, 230)");
    await expect(chain).toHaveCSS("border-color", "rgb(255, 20, 147)");

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

    // entity-spelled attribute strings compare by decoded value, like the runtime path
    await expect(page.getByTestId("entity")).toHaveCSS("color", "rgb(220, 20, 60)");
    await expect(page.getByTestId("entity-runtime")).toHaveCSS("color", "rgb(220, 20, 60)");

    // backslashes in JSX attributes stay literal characters when the condition is inlined
    await expect(page.getByTestId("backslash")).toHaveCSS("color", "rgb(30, 144, 255)");

    // a static merge with a backslash escape in the user className keeps a single
    // backslash after the JSX re-parse - a raw attribute string would double it
    const escape = page.getByTestId("escape");
    const escapeRuntime = page.getByTestId("escape-runtime");
    const foldedClass = (await escape.getAttribute("class")) ?? "";
    const runtimeClass = (await escapeRuntime.getAttribute("class")) ?? "";
    expect(foldedClass).toContain("before:content-['\\d7']");
    expect(foldedClass).not.toContain("before:content-['\\\\d7']");
    // same tokens as the runtime twin, order aside
    expect(foldedClass.split(" ").sort()).toEqual(runtimeClass.split(" ").sort());

    // an emoji className survives byte-exact through the fold, like its twin
    const emojiClass = (await page.getByTestId("emoji").getAttribute("class")) ?? "";
    const emojiRuntimeClass = (await page.getByTestId("emoji-runtime").getAttribute("class")) ?? "";
    expect(emojiClass).toContain("🔥");
    expect(emojiClass.split(" ").sort()).toEqual(emojiRuntimeClass.split(" ").sort());
  }),
);
