"use client";

import { Select } from "@base-ui-components/react/select";
import { Tabs as BaseTabs } from "@base-ui-components/react/tabs";
import { styled } from "next-yak";
import { colors, container, fonts, shadow } from "@/tokens";
import { focusRing, slidingIndicator } from "@/lib/mixins";

/**
 * The dark editor's framework switcher, shared by the hero editor and docs code-block
 * tabs. Fully controlled (drive via `value`/`onValueChange`). The pill group swaps to a
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
  items: readonly string[];
  ariaLabel?: string;
}) {
  const handleChange = (next: unknown) => onValueChange(String(next));

  return (
    <>
      {/* activateOnFocus → arrow keys switch tabs immediately */}
      <SwitcherRoot value={value} onValueChange={handleChange}>
        <SwitcherList activateOnFocus>
          <SwitcherIndicator />
          {items.map((item) => (
            <SwitcherTab key={item} value={item}>
              {item}
            </SwitcherTab>
          ))}
        </SwitcherList>
      </SwitcherRoot>

      <Select.Root value={value} onValueChange={handleChange}>
        <SelectTrigger aria-label={ariaLabel}>
          <Select.Value />
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
            <SelectPopup>
              {items.map((item) => (
                <SelectItem key={item} value={item}>
                  <Select.ItemText>{item}</Select.ItemText>
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
  padding: 3px;
  border-radius: 8px;
  background: ${colors.editorTrack};
`;

const SwitcherIndicator = styled(BaseTabs.Indicator)`
  ${slidingIndicator};
  border-radius: 6px;
  background: ${colors.cyanFill};
  outline: 1px solid ${colors.cyan};
`;

const SwitcherTab = styled(BaseTabs.Tab)`
  position: relative;
  z-index: 1;
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-family: ${fonts.mono};
  font-size: 11px;
  text-align: center;
  color: ${colors.onInkSubtle};
  cursor: pointer;

  @media (prefers-reduced-motion: no-preference) {
    transition: color 0.2s ease;
  }

  &[data-active] {
    color: ${colors.cyan};
  }

  &:focus-visible {
    ${focusRing};
    --focus-ring: ${colors.cyan};
    --focus-ring-offset: 1px;
  }
`;

const SelectTrigger = styled(Select.Trigger)`
  display: flex;
  align-items: center;
  gap: 6px;
  /* matches the pills' height so the title bar doesn't resize when it swaps in */
  padding: 6px 9px;
  border: 1px solid ${colors.cyanBorder};
  border-radius: 6px;
  background: ${colors.editorTrack};
  color: ${colors.cyan};
  font-family: ${fonts.mono};
  font-size: 11px;
  cursor: pointer;

  &:focus-visible {
    ${focusRing};
    --focus-ring: ${colors.cyan};
    --focus-ring-offset: 1px;
  }

  @container editor (min-width: ${container.editor.switch}) {
    display: none;
  }
`;

const SelectIcon = styled(Select.Icon)`
  display: flex;
`;

const SelectPositioner = styled(Select.Positioner)`
  z-index: 50;
`;

const SelectPopup = styled(Select.Popup)`
  min-width: var(--anchor-width);
  padding: 4px;
  /* the popup is a dark panel in both themes (like the editor/terminal); keep it subtle
     in dark mode rather than a bright violet */
  border: 1px solid ${colors.cyanBorder};
  border-radius: 8px;
  background: ${colors.editorPopup};
  box-shadow: ${shadow.popover};
  color: ${colors.onInk};
  font-family: ${fonts.mono};
  font-size: 12px;
`;

const SelectItem = styled(Select.Item)`
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 5px;
  color: ${colors.onInkSubtle};
  cursor: pointer;
  outline: none;

  &[data-highlighted] {
    background: ${colors.onInkHover};
    color: ${colors.onInk};
  }

  &[data-selected] {
    color: ${colors.cyan};
  }
`;
