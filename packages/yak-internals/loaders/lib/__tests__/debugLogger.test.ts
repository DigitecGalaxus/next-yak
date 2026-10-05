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
  expect(spy).toHaveBeenCalledWith("🐮 Yak", "[ts]", "file.tsx", "\n\n", "code");
  expect(spy).toHaveBeenCalledWith("🐮 Yak", "[css-resolved]", "file.tsx", "\n\n", ".b{}");
  spy.mockRestore();
});

test("filters by pattern", () => {
  const log = createDebugLogger({ pattern: "Button" }, "/root");
  const spy = vi.spyOn(console, "log").mockImplementation(() => {});

  log("ts", "code", "/root/src/Button.tsx");
  log("ts", "code", "/root/src/Header.tsx");

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith("🐮 Yak", "[ts]", "src/Button.tsx", "\n\n", "code");
  spy.mockRestore();
});

test("filters by types", () => {
  const log = createDebugLogger({ types: ["css-resolved"] }, "/root");
  const spy = vi.spyOn(console, "log").mockImplementation(() => {});

  log("ts", "code", "/root/file.tsx");
  log("css", ".a{}", "/root/file.tsx");
  log("css-resolved", ".b{}", "/root/file.tsx");

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith("🐮 Yak", "[css-resolved]", "file.tsx", "\n\n", ".b{}");
  spy.mockRestore();
});

test("filters by both pattern and types", () => {
  const log = createDebugLogger({ pattern: "Button", types: ["css", "css-resolved"] }, "/root");
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
