"use client";

import { useEffect, useRef } from "react";
import { styled } from "next-yak";
import { dark } from "@/tokens";
import { errorStyles } from "@/lib/playground/runtimes/error";
import type { Renderer, Runtime } from "@/lib/playground/runtimes/types";

/**
 * Renders into a shadow root so the site CSS and the playground CSS stay apart.
 * The framework runtime owns the mount node, the preview only swaps the style sheets.
 */
export function Preview({
  result,
  sheets,
}: {
  result: { runtime: Runtime; exported: unknown } | null;
  /** not `css`, that name is yak's css prop */
  sheets: string[];
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stylesRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<{ runtime: Runtime; renderer: Renderer } | null>(null);

  useEffect(() => {
    const host = hostRef.current!;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const reset = document.createElement("style");
    reset.textContent = hostReset;
    const styles = document.createElement("div");
    styles.style.display = "none";
    const mount = document.createElement("div");
    mount.style.height = "100%";
    shadow.replaceChildren(reset, styles, mount);
    stylesRef.current = styles;
    mountRef.current = mount;
    return () => {
      rendererRef.current?.renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    stylesRef.current?.replaceChildren(
      ...sheets.map((sheet) => {
        const style = document.createElement("style");
        style.textContent = sheet;
        return style;
      }),
    );
  }, [sheets]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !result) return;
    if (rendererRef.current?.runtime !== result.runtime) {
      rendererRef.current?.renderer.dispose();
      const container = document.createElement("div");
      container.style.height = "100%";
      mount.replaceChildren(container);
      rendererRef.current = { runtime: result.runtime, renderer: result.runtime.createRenderer(container) };
    }
    rendererRef.current.renderer.render(result.exported);
  }, [result]);

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
${errorStyles}`;

const Host = styled.div`
  height: 100%;
  overflow: auto;
`;
