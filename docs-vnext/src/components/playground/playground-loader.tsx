"use client";

import dynamic from "next/dynamic";
import { css, keyframes, styled } from "next-yak";
import { container, ink, radii } from "@/tokens";
import { visuallyHidden } from "@/lib/mixins";
import { EditorDots } from "@/components/landing-page/editor-dots";
import {
  Card,
  Column,
  EditorBody,
  Header,
  HeaderButton,
  OutputBody,
  PackageName,
  PanelLabel,
  PreviewBody,
  PreviewCard,
  PreviewHeader,
  Spacer,
  StatusPill,
  TitleBar,
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
        <TitleBar>
          <EditorDots />
          <PackageName>
            <TextPill />
          </PackageName>
          <Spacer />
          {["Format", "Reset", "Share"].map((label) => (
            <HeaderButton key={label} type="button" disabled tabIndex={-1}>
              {label}
            </HeaderButton>
          ))}
        </TitleBar>
        <Header>
          <SwitcherPill $narrow={110} $wide={330} $pair />
          <Spacer />
          <SwitcherPill $narrow={100} $wide={182} $pair />
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
            <SwitcherPill $narrow={96} $wide={150} />
            <Spacer />
            <ButtonPill style={{ width: 97 }} />
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

/* the sizes of the EditorSwitcher: tab pills when wide, a dropdown when narrow */
const pillsSize = css<{ $wide: number }>`
  width: ${({ $wide }) => `${$wide}px`};
  height: 41.5px;
`;

const SwitcherPill = styled.span<{ $narrow: number; $wide: number; $pair?: boolean }>`
  flex: 0 1 auto;
  width: ${({ $narrow }) => `${$narrow}px`};
  height: 33.5px;
  border-radius: ${radii.card};
  ${placeholder};

  ${({ $pair }) =>
    !$pair &&
    css`
      @container editor (min-width: ${container.editor.switch}) {
        ${pillsSize};
      }
    `}

  @container editor (min-width: ${container.editor.switchPair}) {
    ${pillsSize};
  }
`;

const ButtonPill = styled.span`
  height: 33.5px;
  border-radius: 6px;
  ${placeholder};
`;

const TextPill = styled.span`
  display: block;
  width: 10ch;
  height: 12px;
  border-radius: 6px;
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
