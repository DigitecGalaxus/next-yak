import { Component, type ReactNode } from "react";
import * as React from "react";
import * as ReactJsxRuntime from "react/jsx-runtime";
import { createRoot } from "react-dom/client";
import * as NextYak from "next-yak";
import * as NextYakInternal from "next-yak/internal";
import * as NextYakJsxRuntime from "next-yak/jsx-runtime";
import { ERROR_CLASS } from "./error";
import type { Runtime } from "./types";

export const runtime: Runtime = {
  // `@yak/react` is the new name of `next-yak`, so both point at the same runtime
  modules: {
    react: React,
    "react/jsx-runtime": ReactJsxRuntime,
    "next-yak": NextYak,
    "next-yak/internal": NextYakInternal,
    "next-yak/jsx-runtime": NextYakJsxRuntime,
    "@yak/react": NextYak,
    "@yak/react/internal": NextYakInternal,
    "@yak/react/jsx-runtime": NextYakJsxRuntime,
  },
  packages: ["react", "@yak/react"],
  /**
   * A separate React root, not a portal: events from inside a shadow root are retargeted
   * to the host, so a portal's onClick handlers would never fire.
   */
  createRenderer(container) {
    const root = createRoot(container);
    return {
      render(exported) {
        root.render(<ErrorBoundary resetKey={exported}>{toElement(exported)}</ErrorBoundary>);
      },
      dispose() {
        // unmount after the current render, React does not allow it during one
        queueMicrotask(() => root.unmount());
      },
    };
  },
};

function toElement(exported: unknown): ReactNode {
  if (typeof exported === "function") {
    const App = exported as React.ComponentType;
    return <App />;
  }
  return React.isValidElement(exported) ? exported : null;
}

class ErrorBoundary extends Component<
  { resetKey: unknown; children: ReactNode },
  { error: Error | null; resetKey: unknown }
> {
  state = { error: null as Error | null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  static getDerivedStateFromProps(
    props: { resetKey: unknown },
    state: { error: Error | null; resetKey: unknown },
  ) {
    return props.resetKey === state.resetKey ? null : { error: null, resetKey: props.resetKey };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <pre className={ERROR_CLASS}>{this.state.error.message}</pre>;
  }
}
