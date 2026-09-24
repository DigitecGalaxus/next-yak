"use client";

import { Component, useEffect, useRef, type ComponentType, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { styled } from "next-yak";
import { dark } from "@/tokens";

/**
 * Renders into a shadow root so the site CSS and the playground CSS stay apart.
 * It uses a separate React root, not a portal: events from inside a shadow root are
 * retargeted to the host, so a portal's onClick handlers would never fire.
 */
export function Preview({
  Component,
  sheets,
}: {
  Component: ComponentType | null;
  /** not `css`, that name is yak's css prop */
  sheets: string[];
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Root | null>(null);

  useEffect(() => {
    const host = hostRef.current!;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const container = document.createElement("div");
    container.style.height = "100%";
    shadow.replaceChildren(container);
    const root = createRoot(container);
    rootRef.current = root;
    return () => {
      rootRef.current = null;
      // unmount after the current render, React does not allow it during one
      queueMicrotask(() => root.unmount());
    };
  }, []);

  useEffect(() => {
    rootRef.current?.render(
      <>
        <style>{hostReset}</style>
        {sheets.map((sheet, index) => (
          <style key={index}>{sheet}</style>
        ))}
        <ErrorBoundary resetKey={Component}>{Component ? <Component /> : null}</ErrorBoundary>
      </>,
    );
  }, [Component, sheets]);

  return <Host ref={hostRef} />;
}

/* `all: initial` also resets color-scheme, so it is inherited back to follow the site theme */
const hostReset = `
:host {
  all: initial;
  color-scheme: inherit;
  display: block;
  height: 100%;
  background: light-dark(#fff, ${dark.navy2});
  color: light-dark(#000, ${dark.white});
  font-family: system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.5;
}
`;

const Host = styled.div`
  height: 100%;
  overflow: auto;
`;

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
    return (
      <pre
        style={{
          margin: 16,
          padding: 12,
          borderRadius: 8,
          background: "#fdecec",
          color: "#8a1c1c",
          font: "13px/1.5 ui-monospace, monospace",
          whiteSpace: "pre-wrap",
        }}
      >
        {this.state.error.message}
      </pre>
    );
  }
}
