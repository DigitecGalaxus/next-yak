import type { JSX } from "@solidjs/web";
import { render } from "@solidjs/web";
import { afterEach } from "vitest";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length) {
    cleanups.pop()!();
  }
});

/**
 * Renders JSX into a detached container (jsdom) and cleans up after each test.
 */
export const renderInto = (fn: () => JSX.Element): HTMLElement => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(fn as () => any, container);
  cleanups.push(() => {
    dispose();
    container.remove();
  });
  return container;
};
