import { test, expect, vi } from "vitest";
import { createDebugLogger } from "../debugLogger.js";

test("returns no-op when debug is undefined", () => {
  const log = createDebugLogger(undefined, "/root");
  const spy = vi.spyOn(console, "log");
  log("ts", "code", "/root/file.tsx");
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});

test("logs all types when debug is true", () => {
  const log = createDebugLogger(true, "/root");
  const spy = vi.spyOn(console, "log").mockImplementation(() => {});

  log("ts", "code", "/root/file.tsx");
  log("css", ".a{}", "/root/file.tsx");
  log("css-resolved", ".b{}", "/root/file.tsx");

  expect(spy).toHaveBeenCalledTimes(3);
  expect(spy).toHaveBeenCalledWith(
    "🐮 Yak",
    "[ts]",
    "file.tsx",
    "\n\n",
    "code",
  );
  expect(spy).toHaveBeenCalledWith(
    "🐮 Yak",
    "[css-resolved]",
    "file.tsx",
    "\n\n",
    ".b{}",
  );
  spy.mockRestore();
});

test("filters by pattern", () => {
  const log = createDebugLogger({ pattern: "Button" }, "/root");
  const spy = vi.spyOn(console, "log").mockImplementation(() => {});

  log("ts", "code", "/root/src/Button.tsx");
  log("ts", "code", "/root/src/Header.tsx");

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(
    "🐮 Yak",
    "[ts]",
    "src/Button.tsx",
    "\n\n",
    "code",
  );
  spy.mockRestore();
});

test("filters by types", () => {
  const log = createDebugLogger({ types: ["css-resolved"] }, "/root");
  const spy = vi.spyOn(console, "log").mockImplementation(() => {});

  log("ts", "code", "/root/file.tsx");
  log("css", ".a{}", "/root/file.tsx");
  log("css-resolved", ".b{}", "/root/file.tsx");

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(
    "🐮 Yak",
    "[css-resolved]",
    "file.tsx",
    "\n\n",
    ".b{}",
  );
  spy.mockRestore();
});

test("filters by both pattern and types", () => {
  const log = createDebugLogger(
    { pattern: "Button", types: ["css", "css-resolved"] },
    "/root",
  );
  const spy = vi.spyOn(console, "log").mockImplementation(() => {});

  log("ts", "code", "/root/Button.tsx");
  log("css", ".a{}", "/root/Button.tsx");
  log("css-resolved", ".b{}", "/root/Button.tsx");
  log("css", ".c{}", "/root/Header.tsx");

  expect(spy).toHaveBeenCalledTimes(2);
  spy.mockRestore();
});

test("throws on invalid regex pattern", () => {
  expect(() => createDebugLogger({ pattern: "[invalid" }, "/root")).toThrow(
    'Invalid debug pattern: "[invalid" is not a valid regular expression',
  );
});

test("throws on old string API", () => {
  expect(() => createDebugLogger("Logo" as any, "/root")).toThrow(
    'Before: debug: "Logo"\n' + '  After:  debug: { pattern: "Logo" }',
  );
});

test("throws on old string API with .css$ and suggests types", () => {
  expect(() => createDebugLogger(".css$" as any, "/root")).toThrow(
    'Before: debug: ".css$"\n' + '  After:  debug: { types: ["css"] }',
  );
});

test("throws on old string API with path + .css-resolved$ and suggests both", () => {
  expect(() =>
    createDebugLogger("Button.css-resolved$" as any, "/root"),
  ).toThrow(
    'Before: debug: "Button.css-resolved$"\n' +
      '  After:  debug: { pattern: "Button", types: ["css-resolved"] }',
  );
});

test("throws on old { filter, type } API", () => {
  expect(() =>
    createDebugLogger({ filter: () => true, type: "all" } as any, "/root"),
  ).toThrow("The debug option no longer accepts { filter, type }");
});

test("throws when pattern uses old .css$ file extension convention", () => {
  expect(() => createDebugLogger({ pattern: ".css$" }, "/root")).toThrow(
    'Before: debug: { pattern: ".css$" }\n' +
      '  After:  debug: { types: ["css"] }',
  );
});

test("throws when pattern uses old .css-resolved$ file extension convention", () => {
  expect(() =>
    createDebugLogger({ pattern: ".css-resolved$" }, "/root"),
  ).toThrow(
    'Before: debug: { pattern: ".css-resolved$" }\n' +
      '  After:  debug: { types: ["css-resolved"] }',
  );
});

test("throws when pattern combines path and old .css$ extension convention", () => {
  expect(() => createDebugLogger({ pattern: "Button.css$" }, "/root")).toThrow(
    'Before: debug: { pattern: "Button.css$" }\n' +
      '  After:  debug: { pattern: "Button", types: ["css"] }',
  );
});
