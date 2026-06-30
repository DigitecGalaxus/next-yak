"use client";

import { colors, fonts } from "@/tokens";
import { Tabs as BaseTabs } from "@base-ui-components/react/tabs";
import { styled } from "next-yak";
import { useState, type ReactNode } from "react";
import { editorSurface, editorHeader } from "@/lib/editor-surface";
import { EditorSwitcher } from "@/components/editor-switcher";
import { iconForTab } from "./tab-icons";

export function Tabs({
  title,
  items,
  children,
}: {
  /** Window/file title shown on the left, distinct from the switcher values. */
  title?: string;
  items: string[];
  /** Accepted for compatibility with the docs content; not yet used. */
  groupId?: string;
  children: ReactNode;
}) {
  const [value, setValue] = useState(items[0]);
  const setTab = (next: unknown) => setValue(String(next));
  const icon = iconForTab(value);

  return (
    <Root value={value} onValueChange={setTab}>
      <Header>
        <Title>
          {icon ? <TabIcon>{icon}</TabIcon> : null}
          <TitleText>{title ?? value}</TitleText>
        </Title>

        <EditorSwitcher
          value={value}
          onValueChange={setTab}
          items={items}
          ariaLabel="Select tab"
        />
      </Header>
      {children}
    </Root>
  );
}

export function Tab({ value, children }: { value: string; children: ReactNode }) {
  return <Panel value={value}>{children}</Panel>;
}

// Shares the hero editor's card chrome (editor-surface.ts): file logo + title on the
// left, the switcher on the right.
const Root = styled(BaseTabs.Root)`
  ${editorSurface};
  /* query container the shared EditorSwitcher reads to swap pills ↔ dropdown when narrow */
  container: editor / inline-size;
  margin: 20px 0;
`;

const Header = styled.div`
  ${editorHeader};
  justify-content: space-between;
  gap: 16px;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const TabIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;

  & svg {
    width: 15px;
    height: 15px;
  }
`;

const TitleText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ${fonts.mono};
  font-size: 12px;
  color: ${colors.onInkMuted};
`;

const Panel = styled(BaseTabs.Panel)`
  /* The panel's code block is a <figure> with its own card chrome; strip it so it merges
     into the unified editor container. */
  & > figure {
    margin: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
`;
