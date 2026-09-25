import * as Solid from "solid-js";
import * as SolidWeb from "@solidjs/web";
import * as YakSolid from "@yak/solid";
import * as YakSolidInternal from "@yak/solid/internal";
import { ERROR_CLASS } from "./error";
import type { Runtime } from "./types";

const errorElement = (error: unknown) => {
  const pre = document.createElement("pre");
  pre.className = ERROR_CLASS;
  pre.textContent = error instanceof Error ? error.message : String(error);
  return pre;
};

export const runtime: Runtime = {
  modules: {
    "solid-js": Solid,
    "@solidjs/web": SolidWeb,
    "@yak/solid": YakSolid,
    "@yak/solid/internal": YakSolidInternal,
  },
  packages: ["solid-js", "@solidjs/web", "@yak/solid"],
  /** Solid has no root to re-render, so every result mounts a fresh tree. */
  createRenderer(container) {
    let dispose: (() => void) | undefined;
    const clear = () => {
      dispose?.();
      dispose = undefined;
      container.replaceChildren();
    };
    return {
      render(exported) {
        clear();
        if (typeof exported !== "function") return;
        const App = exported as Solid.Component;
        try {
          dispose = SolidWeb.render(
            () =>
              Solid.createComponent(Solid.Errored, {
                fallback: (error: () => unknown) => errorElement(error()),
                get children() {
                  return Solid.createComponent(App, {});
                },
              }),
            container,
          );
        } catch (error) {
          clear();
          container.append(errorElement(error));
        }
      },
      dispose: clear,
    };
  },
};
