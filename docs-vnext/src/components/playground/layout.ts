import { styled } from "next-yak";
import { fonts, fontWeight, light, dark, ink, status, screen } from "@/tokens";
import { editorSurface, editorHeader, codeReset } from "@/lib/editor-surface";
import { overline } from "@/lib/mixins";

/**
 * The panel layout of the playground, shared by the playground and its loading skeleton
 * (skeleton.tsx). One source for the sizes keeps the two the same, so the page does not
 * jump when the skeleton turns into the playground.
 */

/* one column on a phone and a tablet, editor beside preview and output from 1100px */
export const Workspace = styled.div`
  display: grid;
  gap: 20px;

  @media (min-width: ${screen.toc}) {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    align-items: stretch;
  }
`;

/* Stacked, each panel has its own height: the preview holds a small demo, and the output
   gets most of the window, like the editor, so more compiled code reads at once. Beside the
   editor, the two panels split the editor's height, and long output scrolls inside its
   panel instead of stretching the row. */
export const Column = styled.div`
  display: grid;
  grid-template-rows: 320px clamp(460px, 80vh, 900px);
  gap: 20px;
  min-width: 0;

  @media (min-width: ${screen.toc}) {
    grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
    /* the column reports no size of its own, so the editor alone sets the row height and
       the column stretches to it */
    contain: size;
  }
`;

export const Card = styled.section`
  ${editorSurface};
  /* EditorSwitcher swaps its pills for a dropdown by the card's own width */
  container: editor / inline-size;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
`;

export const Header = styled.div`
  ${editorHeader};
  border-bottom-color: ${ink.divider};
`;

export const Spacer = styled.div`
  flex: 1;
`;

export const EditorBody = styled.div`
  height: clamp(420px, 72vh, 760px);
`;

/* the preview is the user's page, so it sits on a page-coloured card, not the dark editor */
export const PreviewCard = styled.section`
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border: 2.5px solid light-dark(${light.violet}, ${dark.edge});
  border-radius: 12px;
  box-shadow: 3px 3px 0 0 light-dark(${light.violet}, ${dark.edge});
  background: light-dark(#fff, ${dark.navy2});
`;

export const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 2px solid light-dark(${light.violet}, ${dark.edge});
  background: light-dark(${light.beige1}, ${dark.navy1});
`;

export const PanelLabel = styled.span`
  ${overline};
  font-size: 13px;
  letter-spacing: 0.6px;
  color: light-dark(${light.violet}, ${dark.white});
`;

export const StatusPill = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  font-family: ${fonts.mono};
  font-size: 12px;
  font-weight: ${fontWeight.bold};
  color: light-dark(${light.violet}, ${dark.white});
  background: light-dark(${light.beige4}, ${dark.navy4});

  &[data-state="ready"] {
    color: #fff;
    background: ${ink.successDeep};
  }

  &[data-state="error"] {
    color: #fff;
    background: ${status.error};
  }
`;

export const PreviewBody = styled.div`
  flex: 1;
  min-height: 0;
`;

export const OutputBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px 14px;

  ${codeReset};
  pre {
    font-size: 13px;
    line-height: 1.7;
  }
`;
