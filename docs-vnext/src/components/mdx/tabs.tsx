"use client";

import { fonts, ink } from "@/tokens";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { styled } from "next-yak";
import { useState, type ReactNode } from "react";
import { editorSurface, editorHeader } from "@/lib/mixins";
import { EditorSwitcher } from "@/components/editor-switcher";
import { Icon } from "@/components/icon";

export function Tabs({
  title,
  items,
  children,
}: {
  title?: string;
  items: string[];
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
          items={items.map((item) => ({ value: item, node: item }))}
          ariaLabel="Select tab"
        />
      </Header>
      {children}
    </Root>
  );
}

function iconForTab(value: string) {
  const v = value.trim().toLowerCase();
  if (v === "typescript" || /\.(ts|mts|cts|tsx)$/.test(v))
    return <FileBadge bg="#3178C6" fg="#fff" label="TS" />;
  if (v === "javascript" || /\.(js|mjs|cjs|jsx)$/.test(v))
    return <FileBadge bg="#F7DF1E" fg="#000" label="JS" />;
  return null;
}

function FileBadge({ bg, fg, label }: { bg: string; fg: string; label: string }) {
  return (
    <Icon viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2.5" fill={bg} />
      <text
        x="8.2"
        y="11"
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="7.5"
        fontWeight="700"
        fill={fg}
      >
        {label}
      </text>
    </Icon>
  );
}

export function Tab({ value, children }: { value: string; children: ReactNode }) {
  return <Panel value={value}>{children}</Panel>;
}

const Root = styled(BaseTabs.Root)`
  ${editorSurface};
  /* read by EditorSwitcher */
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
  font-size: 13px;
  color: ${ink.fgMuted};
`;

const Panel = styled(BaseTabs.Panel)`
  /* the nested <CodeBlock> drops its own card chrome */
  & > figure {
    margin: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
`;
