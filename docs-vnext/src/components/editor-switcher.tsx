"use client";

import { Select } from "@base-ui-components/react/select";
import { Tabs as BaseTabs } from "@base-ui-components/react/tabs";
import { styled } from "next-yak";
import { container, fonts, radii, shadow, ink } from "@/tokens";
import { focusRing, slidingIndicator } from "@/lib/mixins";
import type { ReactNode } from "react";

/**
 * The dark editor's framework switcher, shared by the hero editor and docs code-block
 * tabs. Fully controlled (drive via `value`/`onValueChange`). The tab group swaps to a
 * compact dropdown when narrow, driven by an `editor` query container — so consumers must
 * set `container: editor / inline-size` on an ancestor.
 */
export function EditorSwitcher({
  value,
  onValueChange,
  items,
  ariaLabel = "Select",
}: {
  value: string;
  onValueChange: (value: string) => void;
  items: readonly { value: string; node: ReactNode }[];
  ariaLabel?: string;
}) {
  const handleChange = (next: unknown) => onValueChange(String(next));

  return (
    <>
      <SwitcherRoot data-ink value={value} onValueChange={handleChange}>
        <SwitcherList activateOnFocus>
          <SwitcherIndicator />
          {items.map((item) => (
            <SwitcherTab key={item.value} value={item.value}>
              {item.node}
            </SwitcherTab>
          ))}
        </SwitcherList>
      </SwitcherRoot>

      <Select.Root value={value} onValueChange={handleChange}>
        <SelectTrigger data-ink aria-label={ariaLabel}>
          <SelectValue>{items.find((i) => i.value === value)?.node}</SelectValue>
          <SelectIcon>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path
                d="M2.5 4 5 6.5 7.5 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </SelectIcon>
        </SelectTrigger>
        <Select.Portal>
          <SelectPositioner sideOffset={6} alignItemWithTrigger={false}>
            <SelectPopup data-ink>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.node}
                  <SelectItemIndicator>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M2.5 6.5 5 9l4.5-5.5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </SelectItemIndicator>
                </SelectItem>
              ))}
            </SelectPopup>
          </SelectPositioner>
        </Select.Portal>
      </Select.Root>
    </>
  );
}

const SwitcherRoot = styled(BaseTabs.Root)`
  display: none;

  @container editor (min-width: ${container.editor.switch}) {
    display: block;
  }
`;

const SwitcherList = styled(BaseTabs.List)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 5px;
  border-radius: ${radii.card};
  background: ${ink.switcherTrack};
  border: 1px solid ${ink.switcherBorder};
`;

const SwitcherTab = styled(BaseTabs.Tab)`
  display: flex;
  gap: 6px;
  align-items: center;
  position: relative;
  z-index: 1;
  padding: 6px 12px;
  border: none;
  /* track radius minus its 4px padding keeps the nested corners concentric */
  border-radius: calc(${radii.card} - 4px);
  background: transparent;
  font-family: ${fonts.mono};
  font-size: 13px;
  text-align: center;
  color: ${ink.fgSubtle};
  cursor: pointer;

  @media (prefers-reduced-motion: no-preference) {
    transition: color 0.2s ease;
  }

  &[data-active] {
    color: #fff;
  }

  &:focus-visible {
    ${focusRing};
    --focus-ring: ${ink.success};
    --focus-ring-offset: 1px;
  }
`;

const SwitcherIndicator = styled(BaseTabs.Indicator)`
  ${slidingIndicator};
  box-sizing: border-box;
  background: ${ink.track};
  border: 1.5px solid ${ink.switcherEdge};
  border-radius: calc(${radii.card} - 4px);
  box-shadow: 2px 2px 0 0 ${ink.switcherEdge};
`;

const SelectTrigger = styled(Select.Trigger)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 96px;
  padding: 6px 10px;
  border: 1px solid ${ink.border};
  border-radius: 6px;
  background: ${ink.track};
  color: ${ink.fg};
  font-family: ${fonts.mono};
  font-size: 13px;
  cursor: pointer;

  &:focus-visible {
    ${focusRing};
    --focus-ring: ${ink.success};
    --focus-ring-offset: 1px;
  }

  @container editor (min-width: ${container.editor.switch}) {
    display: none;
  }
`;

const SelectValue = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const SelectIcon = styled(Select.Icon)`
  display: flex;
  color: ${ink.fgMuted};
`;

const SelectPositioner = styled(Select.Positioner)`
  z-index: 50;
`;

const SelectPopup = styled(Select.Popup)`
  min-width: var(--anchor-width);
  padding: 4px;
  border: 1px solid ${ink.border};
  border-radius: 8px;
  background: ${ink.popup};
  box-shadow: ${shadow.popover};
  color: ${ink.fg};
  font-family: ${fonts.mono};
  font-size: 13px;
`;

const SelectItem = styled(Select.Item)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 5px;
  color: ${ink.fgSubtle};
  cursor: pointer;
  outline: none;

  &[data-highlighted] {
    background: ${ink.hover};
    color: ${ink.fg};
  }

  &[data-selected] {
    color: ${ink.fg};
  }
`;

const SelectItemIndicator = styled(Select.ItemIndicator)`
  display: flex;
  margin-left: auto;
  padding-left: 10px;
  color: ${ink.success};
`;
