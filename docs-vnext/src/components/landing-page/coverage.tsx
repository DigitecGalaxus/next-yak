"use client";

import { Tabs as BaseTabs } from "@base-ui-components/react/tabs";
import { useState } from "react";
import { css, styled } from "next-yak";
import { container, fonts, shadow, light, dark, ink } from "@/tokens";
import { focusRing, overlineSmall, slidingIndicator } from "@/lib/mixins";
import Card from "./card";
import Badge from "./badge";
import { CopyButton } from "./copy-button";
import { NextIcon, RspackIcon, ViteIcon } from "./framework-icons";
import { StorybookIcon, WebpackIcon } from "./tool-icons";
import { frameworks } from "./frameworks";

const TABS = frameworks;

// Bundler/tooling support is the same whatever UI framework you pick — yak plugs into the
// bundler, not the framework — so this list stays put while the install command swaps.
const WORKS_WITH = [
  { label: "Vite", Icon: ViteIcon },
  { label: "Rspack", Icon: RspackIcon },
  { label: "webpack", Icon: WebpackIcon },
  { label: "Next.js", Icon: NextIcon },
  { label: "Storybook", Icon: StorybookIcon },
];

export default function Coverage() {
  const [active, setActive] = useState<string>(TABS[0].id);
  const activeTab = TABS.find((tab) => tab.id === active) ?? TABS[0];

  return (
    <div
      css={css`
        max-width: 1000px;
      `}
    >
      <Card
        css={css`
          padding: 24px;
          border-radius: 20px;
          border: 1px solid light-dark(${light.beige5}, ${dark.navy5});
        `}
      >
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 32px;

            /* terminal + "works with" side by side once there's room for the install
             command not to wrap (the "works with" column can claim up to 340px) */
            @container section (min-width: ${container.section.statGrid}) {
              flex-direction: row;
            }
          `}
        >
          <div
            css={css`
              display: flex;
              flex: 1;
              min-width: 0;
              flex-direction: column;
              gap: 16px;
            `}
          >
            <BaseTabs.Root value={active} onValueChange={(value) => setActive(String(value))}>
              <TabRow activateOnFocus>
                <TabIndicator />
                {TABS.map((tab) => (
                  <Tab key={tab.id} value={tab.id}>
                    <tab.Icon />
                    {tab.label}
                  </Tab>
                ))}
              </TabRow>
            </BaseTabs.Root>

            <Terminal data-ink>
              <TerminalLabel>install</TerminalLabel>
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 16px;
                `}
              >
                <code
                  css={css`
                    font-family: ${fonts.mono};
                    font-size: 14px;
                    color: ${ink.fgMuted};
                  `}
                >
                  <Accent>$</Accent> npm i <Pkg>{activeTab.pkg}</Pkg>
                </code>
                <CopyButton text={`npm i ${activeTab.pkg}`} />
              </div>
            </Terminal>
          </div>

          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 14px;
            `}
          >
            <WorksWithLabel>works with</WorksWithLabel>
            <ul
              css={css`
                display: flex;
                flex-wrap: wrap;
                gap: 9px 10px;
                list-style: none;
                max-width: 450px;
              `}
            >
              {WORKS_WITH.map((tool) => (
                <Badge key={tool.label}>
                  <tool.Icon />
                  {tool.label}
                </Badge>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <p
        css={css`
          font-size: 13px;
          color: light-dark(${light.violetSoft}, ${dark.fog});
          margin-top: 24px;
          margin-left: 8px;
        `}
      >
        + any Vite-based framework (React Router, TanStack Start) and more
      </p>
    </div>
  );
}

// Base UI Tabs: real tablist/arrow-key a11y + an auto-measured sliding indicator.
const TabRow = styled(BaseTabs.List)`
  position: relative;
  display: inline-flex;
  align-self: flex-start;
  gap: 4px;
  padding: 4px;
  border-radius: 10px;
  background: light-dark(${light.beige3}, ${dark.navy3});
`;

const TabIndicator = styled(BaseTabs.Indicator)`
  ${slidingIndicator};
  border-radius: 7px;
  /* A raised light pill (lighter than the beigeDark track in both themes). The tab text
     keeps its normal violet — readable on the pill AND on the track — instead of flipping
     to white, which vanished whenever the indicator measured narrower than the label
     (e.g. the initially-selected tab, before the mono font/icon settle). */
  background: light-dark(${light.beige1}, ${dark.navy1});
  box-shadow: ${shadow.indicator};
`;

const Tab = styled(BaseTabs.Tab)`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border: none;
  border-radius: 7px;
  background: transparent;
  font-family: ${fonts.mono};
  font-size: 13px;
  font-weight: 700;
  color: light-dark(${light.violet}, ${dark.white});
  cursor: pointer;

  &:focus-visible {
    ${focusRing};
  }
`;

const Terminal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 10px;
  background: ${ink.base};
`;

const Accent = styled.span`
  color: ${ink.cyan};
`;

const TerminalLabel = styled(Accent)`
  ${overlineSmall};
`;

const Pkg = styled.span`
  color: ${ink.fg};
`;

const WorksWithLabel = styled.span`
  ${overlineSmall};
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;
