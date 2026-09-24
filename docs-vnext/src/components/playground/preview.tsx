"use client";

import { Component, useEffect, useRef, type ComponentType, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { styled } from "next-yak";
import { dark } from "@/tokens";

/**
 * Renders the playground component inside a shadow root.
 *
 * The shadow root keeps the two style sheets apart: the site's CSS does not reach the
 * preview, and a global selector in the playground (`html.dark &`, `body`) does not restyle
 * the site. `:host { all: initial }` also stops the site's font and colour from being
 * inherited, so the preview looks like a blank page with only the playground's CSS.
 *
 * It is a separate React root, not a portal. React listens for events on its root
 * container, and a click inside a shadow root reaches a listener outside it retargeted to
 * the host element, so a portal's onClick handlers would never fire.
 */
export function Preview({
  Component,
  sheets,
}: {
  Component: ComponentType | null;
  /** one style sheet per file. Not `css`: that prop name belongs to yak's css prop. */
  sheets: string[];
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Root | null>(null);

  useEffect(() => {
    const host = hostRef.current!;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const container = document.createElement("div");
    // the container fills the panel, like a page body, so playground code can size to it
    // (`min-height: 100%`) and centre itself in the preview
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

/**
 * `all: initial` drops everything the site would pass down. `color-scheme` comes back on
 * purpose: the preview follows the site's light or dark theme, so it paints a white page in
 * light mode and a dark page in dark mode, and playground CSS can use light-dark() too.
 */
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

/** Shows a render error in place of the component, until the next compile. */
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
