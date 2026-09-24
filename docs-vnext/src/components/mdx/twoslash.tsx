"use client";

import { PreviewCard } from "@base-ui/react/preview-card";
import type { ReactNode } from "react";
import { styled } from "next-yak";
import { fonts, shadow, light, dark, ink } from "@/tokens";

// Renders the twoslash hover popups as a portaled PreviewCard, so the code block's
// `overflow` does not clip them.
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
        <Content>{children}</Content>
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

  /* portaled out of <Pre>, so the shiki token colors must be applied again */
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
