import { css } from "next-yak";
import { fonts, shadow, ink } from "@/tokens";

/**
 * The dark "code editor" chrome shared by docs code blocks and tab groups, mirroring
 * the hero editor card on the landing page (see landing-page/hero-editor-view.tsx):
 * a navy ink fill, a hairline border, a soft elevation shadow, and rounded corners —
 * so code in the docs reads as the same component as the hero, not a different box.
 */
export const editorSurface = css`
  border: 1px solid ${ink.border};
  border-radius: 12px;
  background: ${ink.card};
  box-shadow: ${shadow.card};
  overflow: hidden;
`;

/**
 * The editor title bar shared by the standalone code block (file title) and the tab
 * group (file title + switcher). A fixed height keeps both headers identical, so a
 * tabbed and an untabbed code block line up; the divider matches the hero editor.
 */
export const editorHeader = css`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 6px 12px;
  border-bottom: 2px solid ${ink.border};
`;

/**
 * Resets the shiki-highlighted `<pre>`/`<code>` inside an editor card so the card's ink
 * fill shows through and the mono font is consistent — shared by the hero editor and the
 * landing code panel. Consumers set their own `font-size`/`line-height` on the `pre`.
 */
export const codeReset = css`
  pre {
    margin: 0;
    overflow-x: auto;
    font-family: ${fonts.mono};
    background: transparent !important;
  }

  code {
    font-family: inherit;
  }
`;
