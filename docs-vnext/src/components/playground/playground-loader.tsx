"use client";

import dynamic from "next/dynamic";
import { css, keyframes, styled } from "next-yak";
import { ink, radii } from "@/tokens";
import { visuallyHidden } from "@/lib/mixins";
import {
  Card,
  Column,
  EditorBody,
  Header,
  OutputBody,
  PanelLabel,
  PreviewBody,
  PreviewCard,
  PreviewHeader,
  Spacer,
  StatusPill,
  Workspace,
} from "./layout";

/** Monaco, the worker and the WASM compiler need `window`, so the playground loads in the browser only. */
export const PlaygroundLoader = dynamic(() => import("./playground"), {
  ssr: false,
  loading: () => <PlaygroundSkeleton />,
});

const editorLines = [44, 30, 38, 0, 56, 48, 0, 22, 34, 46, 52, 40, 30, 0, 36, 58, 42, 26];
const outputLines = [36, 24, 30, 42, 20, 0, 38, 28, 46, 22];

function PlaygroundSkeleton() {
  return (
    <Workspace aria-busy="true">
      <Hidden role="status">Loading the playground</Hidden>

      <Card aria-hidden="true">
        <Header>
          <Pill style={{ width: 300 }} />
          <Spacer />
          <Pill style={{ width: 200 }} />
        </Header>
        <EditorBody>
          <Lines lines={editorLines} />
        </EditorBody>
      </Card>

      <Column aria-hidden="true">
        <PreviewCard>
          <PreviewHeader>
            <PanelLabel>Preview</PanelLabel>
            <StatusPill data-state="loading">Loading</StatusPill>
          </PreviewHeader>
          <PreviewBody />
        </PreviewCard>

        <Card>
          <Header>
            <Pill style={{ width: 150 }} />
            <Spacer />
            <Pill style={{ width: 90 }} />
          </Header>
          <OutputBody>
            <Lines lines={outputLines} />
          </OutputBody>
        </Card>
      </Column>
    </Workspace>
  );
}

function Lines({ lines }: { lines: number[] }) {
  return (
    <LineList>
      {lines.map((width, index) => (
        <Line key={index} style={{ width: `${width}%` }} />
      ))}
    </LineList>
  );
}

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
`;

const placeholder = css`
  background: ${ink.fill};
  @media (prefers-reduced-motion: no-preference) {
    animation: ${pulse} 1.6s ease-in-out infinite;
  }
`;

const Hidden = styled.span`
  ${visuallyHidden};
`;

/* the height of the tab switcher it stands in for */
const Pill = styled.span`
  flex: 0 1 auto;
  height: 42px;
  border-radius: ${radii.card};
  ${placeholder};
`;

/* padding and line height of the Monaco editor (13px text on 22px lines) */
const LineList = styled.div`
  display: grid;
  gap: 12px;
  padding: 18px 16px;
`;

const Line = styled.span`
  display: block;
  height: 10px;
  border-radius: 5px;
  ${placeholder};
`;
