"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { styled } from "next-yak";
import type { ReactNode } from "react";
import { fonts, shadow, light, dark } from "@/tokens";
import { focusRing, slidingIndicator } from "@/lib/mixins";

/**
 * A light-surface pill group for switching between a few options on the page (as
 * opposed to the dark editor's switcher). Fully controlled.
 */
export function SegmentedTabs({
  value,
  onValueChange,
  items,
  ariaLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  items: readonly { value: string; node: ReactNode }[];
  ariaLabel?: string;
}) {
  return (
    <BaseTabs.Root value={value} onValueChange={(next) => onValueChange(String(next))}>
      <Track activateOnFocus aria-label={ariaLabel}>
        <Indicator />
        {items.map((item) => (
          <Tab key={item.value} value={item.value}>
            {item.node}
          </Tab>
        ))}
      </Track>
    </BaseTabs.Root>
  );
}

const Track = styled(BaseTabs.List)`
  position: relative;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  border-radius: 10px;
  background: light-dark(${light.beige3}, ${dark.navy3});
`;

const Indicator = styled(BaseTabs.Indicator)`
  ${slidingIndicator};
  border-radius: 7px;
  /* a raised light pill; the tab text keeps its normal colour so it reads on the pill
     and on the track alike */
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

  @media (prefers-reduced-motion: no-preference) {
    transition: background 0.16s ease;
  }

  /* A control in a group answers with its own surface, not with the link red. The
     active tab already carries the sliding pill, and a surface under that pill reads as
     a mistake, so it stays out. Base UI marks the active tab with data-active, which is
     also the attribute the editor switcher reads. */
  &:hover:not([data-active]) {
    background: light-dark(${light.beige4}, ${dark.navy4});
  }

  &:focus-visible {
    ${focusRing};
  }
`;
