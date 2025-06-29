// @ts-nocheck
import { it, expect } from "vitest";
import { mergeCssProp } from "../internals/mergeCssProp";
import { css } from "../cssLiteral";
import { atoms } from "../atoms";

it("merge properties when className is set", async () => {
  expect(
    mergeCssProp(
      { className: "btn btn-primary" },
      css("yakCss1", () => ({
        style: { "--yak-var1": "0.5rem" },
      })),
    ),
  ).toMatchObject({
    className: "btn btn-primary yakCss1",
    style: { "--yak-var1": "0.5rem" },
  });
});

it("merge properties when style is set", async () => {
  expect(
    mergeCssProp(
      { style: { padding: "8px", margin: "4px" } },
      css(() => ({
        className: "yakClass1",
        style: { "--yak-var1": "#ffffff" },
      })),
    ),
  ).toMatchObject({
    className: "yakClass1",
    style: { padding: "8px", margin: "4px", "--yak-var1": "#ffffff" },
  });
});

it("merge properties when spreaded property is set", async () => {
  expect(
    mergeCssProp(
      { className: "container mx-auto" },
      css(() => ({
        className: "yakClass1 yakClass2",
        style: { "--yak-var1": "1200px" },
      })),
    ),
  ).toMatchObject({
    className: "container mx-auto yakClass1 yakClass2",
    style: { "--yak-var1": "1200px" },
  });
});

it("merge properties when class name and style is set", async () => {
  expect(
    mergeCssProp(
      { className: "text-lg font-semibold", style: { lineHeight: "1.6" } },
      css(() => ({
        className: "yakClass1 yakClass2",
        style: { "--yak-var1": "#1f2937" },
      })),
    ),
  ).toMatchObject({
    className: "text-lg font-semibold yakClass1 yakClass2",
    style: { lineHeight: "1.6", "--yak-var1": "#1f2937" },
  });
});

it("merge properties when class name, style and spreaded property is set", async () => {
  expect(
    mergeCssProp(
      { className: "flex items-center", style: { gap: "1rem" } },
      css(() => ({
        className: "yakClass1 yakClass2",
        style: { "--yak-var1": "4rem" },
      })),
    ),
  ).toMatchObject({
    className: "flex items-center yakClass1 yakClass2",
    style: { gap: "1rem", "--yak-var1": "4rem" },
  });
});

it("merge properties with atoms using conditional classes", async () => {
  expect(
    mergeCssProp(
      { className: "w-full" },
      atoms("p-4 rounded-md", false && "hidden", true && "bg-white shadow-sm"),
    ),
  ).toMatchObject({
    className: "w-full p-4 rounded-md bg-white shadow-sm",
  });
});

it("merge properties with atoms using callback and conditional classes", async () => {
  expect(
    mergeCssProp(
      { className: "relative" },
      atoms(
        "border border-gray-200",
        true && "hover:border-gray-300",
        false && "opacity-50",
        (_, classNames, style) => {
          classNames.add("focus:ring-2 focus:ring-blue-500");
          style["--ring-offset"] = "2px";
        },
      ),
    ),
  ).toMatchObject({
    className:
      "relative border border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500",
    style: { "--ring-offset": "2px" },
  });
});

it("merge properties with atoms callback only", async () => {
  expect(
    mergeCssProp(
      { className: "grid" },
      atoms((_, classNames, style) => {
        classNames.add("grid-cols-3 gap-4");
        classNames.add("md:grid-cols-6");
        style["--grid-gap"] = "1rem";
      }),
    ),
  ).toMatchObject({
    className: "grid grid-cols-3 gap-4 md:grid-cols-6",
    style: { "--grid-gap": "1rem" },
  });
});

it("merge properties with css wrapping atoms", async () => {
  expect(
    mergeCssProp(
      { className: "card" },
      css(
        "yakClass1",
        atoms("bg-white rounded-lg shadow-md", (_, classNames, style) => {
          classNames.add("p-6 hover:shadow-lg");
          style["--card-transition"] = "all 0.2s ease";
        }),
      ),
    ),
  ).toMatchObject({
    className:
      "card yakClass1 bg-white rounded-lg shadow-md p-6 hover:shadow-lg",
    style: { "--card-transition": "all 0.2s ease" },
  });
});

it("merge properties with css, atoms, and function combination", async () => {
  expect(
    mergeCssProp(
      { className: "btn", style: { cursor: "pointer" } },
      css(
        "yakClass1",
        atoms(
          "px-4 py-2 rounded-md",
          true && "text-white bg-blue-600",
          (_, classNames, style) => {
            classNames.add("hover:bg-blue-700 focus:outline-none");
            style["--btn-focus-ring"] = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          },
        ),
        () => ({
          className: "yakClass2 yakClass3",
          style: { "--yak-var1": "500" },
        }),
      ),
    ),
  ).toMatchObject({
    className:
      "btn yakClass1 px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none yakClass2 yakClass3",
    style: {
      cursor: "pointer",
      "--btn-focus-ring": "0 0 0 3px rgba(59, 130, 246, 0.1)",
      "--yak-var1": "500",
    },
  });
});

it("merge properties with nested css and atoms removing classes", async () => {
  expect(
    mergeCssProp(
      { className: "input base-input" },
      css(
        "yakClass1",
        atoms("border border-gray-300 rounded-md", (_, classNames, style) => {
          classNames.delete("input");
          classNames.delete("yakClass1");
          classNames.add(
            "focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
          );
          style["--input-padding"] = "0.75rem";
        }),
        () => ({ style: { "--yak-var1": "1rem" } }),
      ),
    ),
  ).toMatchObject({
    className:
      "base-input border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
    style: {
      "--input-padding": "0.75rem",
      "--yak-var1": "1rem",
    },
  });
});

it("merge properties with complex atoms manipulation", async () => {
  expect(
    mergeCssProp(
      { className: "modal" },
      atoms(
        "fixed inset-0 z-50",
        true && "bg-black bg-opacity-50",
        false && "hidden",
        (_, classNames, style) => {
          classNames.add("flex items-center justify-center");
          classNames.add("animate-fadeIn");
          style["--modal-backdrop-blur"] = "blur(4px)";
          style.backdropFilter = "blur(4px)";
        },
      ),
    ),
  ).toMatchObject({
    className:
      "modal fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn",
    style: {
      "--modal-backdrop-blur": "blur(4px)",
      backdropFilter: "blur(4px)",
    },
  });
});

it("merge properties with responsive design classes", async () => {
  expect(
    mergeCssProp(
      { className: "w-full" },
      atoms(
        "sm:w-1/2 md:w-1/3 lg:w-1/4",
        true && "p-4",
        false && "hidden",
        (_, classNames, style) => {
          classNames.add("xl:w-1/5 2xl:w-1/6");
          style["--responsive-padding"] = "clamp(0.5rem, 2vw, 1rem)";
        },
      ),
    ),
  ).toMatchObject({
    className: "w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4 xl:w-1/5 2xl:w-1/6",
    style: { "--responsive-padding": "clamp(0.5rem, 2vw, 1rem)" },
  });
});

it("merge properties with form styling", async () => {
  expect(
    mergeCssProp(
      { className: "form-control", style: { minHeight: "40px" } },
      css(
        "yakClass1",
        atoms(
          "w-full px-3 py-2",
          "border border-gray-300 rounded-md",
          true && "focus:outline-none focus:ring-2 focus:ring-blue-500",
          (_, classNames, style) => {
            classNames.add("placeholder-gray-400 text-gray-900");
            style["--input-transition"] =
              "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out";
          },
        ),
        () => ({ style: { "--yak-var1": "1.5" } }),
      ),
    ),
  ).toMatchObject({
    className:
      "form-control yakClass1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900",
    style: {
      minHeight: "40px",
      "--input-transition":
        "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
      "--yak-var1": "1.5",
    },
  });
});

it("merge properties with dark mode and state variants", async () => {
  expect(
    mergeCssProp(
      { className: "theme-card" },
      css(
        "yakClass1",
        atoms(
          "bg-white dark:bg-gray-800",
          "text-gray-900 dark:text-white",
          true && "hover:bg-gray-50 dark:hover:bg-gray-700",
          false && "opacity-50",
          (_, classNames, style) => {
            classNames.add("transition-all duration-200");
            classNames.add("border border-gray-200 dark:border-gray-700");
            style["--card-shadow"] =
              "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
            style["--card-shadow-dark"] =
              "0 1px 3px 0 rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(255, 255, 255, 0.06)";
          },
        ),
      ),
    ),
  ).toMatchObject({
    className:
      "theme-card yakClass1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-700",
    style: {
      "--card-shadow":
        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      "--card-shadow-dark":
        "0 1px 3px 0 rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(255, 255, 255, 0.06)",
    },
  });
});
