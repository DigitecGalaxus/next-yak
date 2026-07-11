"use client";

import { Meter } from "@base-ui-components/react/meter";
import { css, styled } from "next-yak";
import type { CSSProperties } from "react";
import { fonts, fontWeight, radii, light, dark } from "@/tokens";

// A single labelled benchmark bar, built on Base UI Meter — it owns the role="meter"
// semantics and aria-value* wiring, and sizes the fill from the value for us.
export default function Bar({
  label,
  value,
  percent,
  accent = false,
  className,
  style,
}: {
  label: string;
  value: string;
  percent: number;
  accent?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Root
      value={percent}
      getAriaValueText={() => `${value} renders per second`}
      className={className}
      style={style}
    >
      <Header>
        <BarLabel $accent={accent}>{label}</BarLabel>
        <BarValue $accent={accent}>{value}</BarValue>
      </Header>
      <Track>
        <Indicator $accent={accent} />
      </Track>
    </Root>
  );
}

const Root = styled(Meter.Root)`
  & > * + * {
    margin-top: 8px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
`;

const BarLabel = styled(Meter.Label)<{ $accent?: boolean }>`
  font-size: 13px;
  ${({ $accent }) =>
    $accent &&
    css`
      font-weight: ${fontWeight.bold};
      color: light-dark(${light.violet}, ${dark.white});
    `}
`;

const BarValue = styled.span<{ $accent?: boolean }>`
  font-family: ${fonts.mono};
  font-size: 13px;
  font-weight: ${fontWeight.bold};
  ${({ $accent }) =>
    $accent &&
    css`
      color: light-dark(${light.red}, ${dark.red});
    `}
`;

const Track = styled(Meter.Track)`
  width: 100%;
  height: 18px;
  border-radius: ${radii.pill};
  background: light-dark(${light.beige4}, ${dark.navy4});
  overflow: hidden;
`;

const Indicator = styled(Meter.Indicator)<{ $accent?: boolean }>`
  height: 100%;
  border-radius: ${radii.pill};
  background: light-dark(${light.beige6}, ${dark.navy6});
  ${({ $accent }) =>
    $accent &&
    css`
      background: light-dark(${light.red}, ${dark.redDeep});
    `}
`;
