"use client";

import { PreviewCard } from "@base-ui-components/react/preview-card";
import type { ReactNode } from "react";
import { styled } from "next-yak";
import { fonts, shadow, light, dark, ink } from "@/tokens";

/**
 * Maps the `<Popup>/<PopupTrigger>/<PopupContent>` hover popups emitted by fumadocs'
 * twoslash transformer onto base-ui `PreviewCard`, so the popup portals out of the code
 * block (no clipping by the panel's `overflow`) and stays on base-ui + next-yak.
 */
export function Popup({ children }: { children: ReactNode }) {
  return <PreviewCard.Root>{children}</PreviewCard.Root>;
}

export function PopupTrigger({ children }: { children: ReactNode }) {
  return <PreviewCard.Trigger render={<Trigger />}>{children}</PreviewCard.Trigger>;
}

export function PopupContent({ children }: { children: ReactNode }) {
  return (
    <PreviewCard.Portal>
      <Positioner side="bottom" align="start" sideOffset={6}>
        <Content data-ink>{children}</Content>
      </Positioner>
    </PreviewCard.Portal>
  );
}

const Trigger = styled.span`
  border-bottom: 1px dashed ${ink.underline};
  cursor: help;
`;

const Positioner = styled(PreviewCard.Positioner)`
  z-index: 70;
`;

const Content = styled(PreviewCard.Popup)`
  max-width: 480px;
  max-height: 320px;
  overflow: auto;
  padding: 10px 12px;
  /* violetLight (not violet): in light mode violet == the navy code fill, so the border would
     vanish. popover bg sits a step above the code so the panel reads as floating. */
  border: 1.5px solid light-dark(${light.violetSoft}, ${dark.fog});
  border-radius: 8px;
  background: ${ink.popover};
  color: ${ink.fg};
  font-family: ${fonts.mono};
  font-size: 13px;
  line-height: 1.5;
  box-shadow: ${shadow.popover};

  & .twoslash-popup-code {
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Portaled out of <Pre>, so re-apply the shiki token colors (each span has its own
     --shiki-light/-dark). */
  & .twoslash-popup-code span {
    color: light-dark(var(--shiki-light), var(--shiki-dark));
  }

  & .twoslash-popup-docs {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid ${ink.divider};
    color: ${ink.fgSubtle};
    font-family: ${fonts.body};
    font-size: 13px;
  }

  & .twoslash-popup-docs-tags {
    margin-top: 4px;
    color: ${ink.fgSubtle};
  }
`;
