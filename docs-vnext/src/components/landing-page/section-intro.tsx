import { styled } from "next-yak";
import type { CSSProperties, ReactNode } from "react";
import { fontWeight, light, dark } from "@/tokens";
import Eyebrow from "./eyebrow";

// className/style are forwarded to the root Wrap, so a call site can overstyle the
// block (e.g. css={css`max-width: 450px`}) instead of threading a width prop through.
export default function SectionIntro({
  eyebrow,
  title,
  className,
  style,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <Wrap className={className} style={style}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <SectionHeading>{title}</SectionHeading>
      {children ? <SubHeading>{children}</SubHeading> : null}
    </Wrap>
  );
}

export const SectionHeading = styled.h2`
  color: light-dark(${light.violet}, ${dark.white});
  /* fluid: scales with the section's width (cqi), capped at the desktop size */
  font-size: clamp(30px, 6cqi, 48px);
  font-weight: ${fontWeight.black};
  line-height: 110%;
  letter-spacing: -0.025em;
`;

export const SubHeading = styled.p`
  line-height: 24px;
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
`;
