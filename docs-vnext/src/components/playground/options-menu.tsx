"use client";

import { Menu } from "@base-ui/react/menu";
import { styled } from "next-yak";
import { fonts, shadow, ink } from "@/tokens";
import { focusRing } from "@/lib/mixins";
import type { TransformOptions } from "@/lib/playground/types";

const items: { key: keyof TransformOptions; label: string; hint: string }[] = [
  { key: "minify", label: "Minify", hint: "Short hashed class names, as in production" },
  { key: "showComments", label: "Comments", hint: "Keep comments in the JSX and JS output" },
  { key: "foldStatic", label: "Fold static", hint: "Plain elements for styles without props" },
];

/**
 * The compiler options, in a menu on the output panel's title bar. As a row of toggles
 * they took a full line of the panel, and the options change far less often than the
 * output is read. The menu stays open while options change, so a reader can flip one
 * and watch the output update behind it.
 */
export function OptionsMenu({
  options,
  onChange,
}: {
  options: TransformOptions;
  onChange: (options: TransformOptions) => void;
}) {
  return (
    <Menu.Root>
      <Trigger>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
          <circle cx="10" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
          <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
        </svg>
        Options
      </Trigger>
      <Menu.Portal>
        <Positioner sideOffset={6} align="end">
          <Popup data-ink>
            {items.map((item) => (
              <Item
                key={item.key}
                checked={options[item.key]}
                onCheckedChange={(checked) => onChange({ ...options, [item.key]: checked })}
                closeOnClick={false}
              >
                <Box aria-hidden>
                  <Menu.CheckboxItemIndicator>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6.5 5 9l4.5-5.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Menu.CheckboxItemIndicator>
                </Box>
                <span>
                  <Label>{item.label}</Label>
                  <Hint>{item.hint}</Hint>
                </span>
              </Item>
            ))}
          </Popup>
        </Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

const Trigger = styled(Menu.Trigger)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid ${ink.border};
  border-radius: 6px;
  background: transparent;
  color: ${ink.fgSubtle};
  font-family: ${fonts.mono};
  font-size: 13px;
  cursor: pointer;

  &:hover,
  &[data-popup-open] {
    background: ${ink.hover};
    color: ${ink.fg};
  }

  &:focus-visible {
    ${focusRing};
    --focus-ring: ${ink.success};
    --focus-ring-offset: 1px;
  }
`;

const Positioner = styled(Menu.Positioner)`
  z-index: 50;
`;

const Popup = styled(Menu.Popup)`
  min-width: 240px;
  padding: 4px;
  border: 1px solid ${ink.border};
  border-radius: 8px;
  background: ${ink.popup};
  box-shadow: ${shadow.popover};
  outline: none;
`;

const Item = styled(Menu.CheckboxItem)`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  color: ${ink.fg};
  font-family: ${fonts.mono};
  font-size: 13px;
  cursor: pointer;
  outline: none;

  &[data-highlighted] {
    background: ${ink.hover};
  }
`;

const Box = styled.span`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 14px;
  height: 14px;
  margin-top: 2px;
  border: 1.5px solid ${ink.fgMuted};
  border-radius: 4px;
  color: ${ink.switcherEdge};

  [data-checked] > & {
    border-color: ${ink.success};
    background: ${ink.success};
  }
`;

const Label = styled.span`
  display: block;
`;

const Hint = styled.span`
  display: block;
  margin-top: 2px;
  color: ${ink.fgMuted};
  font-size: 12px;
`;
