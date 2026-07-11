import { css, styled } from "next-yak";
import type { CSSProperties } from "react";
import { fonts, fontSize, fontWeight, light, dark } from "@/tokens";
import Card from "./card";

export default function StatCard({
  value,
  suffix,
  description,
  accent = false,
  className,
  style,
}: {
  value: string;
  suffix: string;
  description: string;
  accent?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <StatCardBox className={className} style={style}>
      <div
        css={css`
          display: flex;
          align-items: baseline;
          gap: 4px;
        `}
      >
        <StatNumber $accent={accent}>{value}</StatNumber>
        <StatSuffix $accent={accent}>{suffix}</StatSuffix>
      </div>
      <span
        css={css`
          font-size: ${fontSize.small};
        `}
      >
        {description}
      </span>
    </StatCardBox>
  );
}

const StatCardBox = styled(Card)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 24px;
`;

const StatNumber = styled.span<{ $accent?: boolean }>`
  font-weight: ${fontWeight.extrabold};
  font-size: 44px;
  color: light-dark(${light.violet}, ${dark.white});
  ${({ $accent }) =>
    $accent &&
    css`
      color: light-dark(${light.red}, ${dark.red});
    `}
`;

const StatSuffix = styled.span<{ $accent?: boolean }>`
  font-size: 22px;
  font-weight: ${fontWeight.semibold};
  ${({ $accent }) =>
    $accent &&
    css`
      color: light-dark(${light.red}, ${dark.red});
    `}
`;
