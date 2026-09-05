// The browser half of the hydration test: hydrates the markup the SSR test
// project rendered (tree.ssr.html) and requires a clean hydration: every
// server node reused, nothing logged, bindings live afterwards.
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { hydrate } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { createTree } from "./tree.ts";
import html from "./tree.ssr.html?raw";

let root: HTMLElement;
beforeEach(() => {
  // the store Solid's inline hydration script creates before the app runs
  (globalThis as any)._$HY = { events: [], completed: new WeakSet(), r: {}, fe() {} };
  root = document.createElement("div");
  root.innerHTML = html;
  document.body.append(root);
});
afterEach(() => {
  root.remove();
});

it("hydrates the server markup without errors or warnings", () => {
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  const warnings = vi.spyOn(console, "warn").mockImplementation(() => {});
  const serverNodes = [...root.querySelectorAll("*")];
  const [i, setI] = createSignal(0);

  const dispose = hydrate(() => createTree(i), root);

  expect(errors).not.toHaveBeenCalled();
  expect(warnings).not.toHaveBeenCalled();
  const clientNodes = [...root.querySelectorAll("*")];
  expect(clientNodes.length).toBe(serverNodes.length);
  for (const node of serverNodes) expect(clientNodes).toContain(node);

  // the props the server saw
  const dot = root.querySelector("span.dot")!;
  expect(dot.className).toBe("dot active");
  expect(dot.getAttribute("style")).toBe("--x:0");
  expect(root.querySelector("input")!.hasAttribute("$hidden")).toBe(false);
  expect(root.querySelector("input")!.type).toBe("text");
  expect(root.querySelector("circle")!.namespaceURI).toBe("http://www.w3.org/2000/svg");
  expect(root.querySelector("button.base.ghost")).not.toBeNull();
  expect(root.querySelector("section.card.chip button.base")!.hasAttribute("label")).toBe(false);

  // bindings stay live on the reused nodes
  setI(1);
  flush();
  expect(root.querySelector("span.dot")).toBe(dot);
  expect(dot.className).toBe("dot");
  expect(dot.textContent).toBe("1");
  expect(errors).not.toHaveBeenCalled();
  expect(warnings).not.toHaveBeenCalled();

  dispose();
  errors.mockRestore();
  warnings.mockRestore();
});
