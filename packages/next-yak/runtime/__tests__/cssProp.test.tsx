// @ts-nocheck
import { it, expect } from "vitest";
import { mergeCssProp } from "../internals/mergeCssProp";
import { css } from "../cssLiteral";

it("merge properties when className is set", async () => {
  expect(
    mergeCssProp(
      { className: "foo" },
      css("cssProp", () => ({
        style: { "--any-var": "any" },
      })),
    ),
  ).toMatchObject({ className: "foo cssProp", style: { "--any-var": "any" } });
});
it("merge properties when style is set", async () => {
  expect(
    mergeCssProp(
      { style: { padding: "5px" } },
      css(() => ({ className: "cssProp", style: { "--any-var": "any" } })),
    ),
  ).toMatchObject({
    className: "cssProp",
    style: { padding: "5px", "--any-var": "any" },
  });
});
it("merge properties when spreaded property is set", async () => {
  expect(
    mergeCssProp(
      { className: "foo" },
      css(() => ({ className: "cssProp", style: { "--any-var": "any" } })),
    ),
  ).toMatchObject({ className: "foo cssProp", style: { "--any-var": "any" } });
});
it("merge properties when class name and style is set", async () => {
  expect(
    mergeCssProp(
      { className: "foo", style: { padding: "5px" } },
      css(() => ({ className: "cssProp", style: { "--any-var": "any" } })),
    ),
  ).toMatchObject({
    className: "foo cssProp",
    style: { padding: "5px", "--any-var": "any" },
  });
});
it("merge properties when class name, style and spreaded property is set", async () => {
  expect(
    mergeCssProp(
      { className: "foo", style: { padding: "5px" } },
      css(() => ({ className: "cssProp", style: { "--any-var": "any" } })),
    ),
  ).toMatchObject({
    className: "foo cssProp",
    style: { padding: "5px", "--any-var": "any" },
  });
});
