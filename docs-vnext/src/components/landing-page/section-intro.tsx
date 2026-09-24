import { styled } from "next-yak";
import type { CSSProperties, ReactNode } from "react";
import { fontSize, fontWeight, light, dark } from "@/tokens";
import { overline } from "@/lib/mixins";

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
  font-size: clamp(30px, 6cqi, 48px);
  font-weight: ${fontWeight.black};
  line-height: 110%;
  letter-spacing: -0.025em;
`;

export const Eyebrow = styled.span`
  ${overline};
  color: light-dark(${light.red}, ${dark.red});
  font-size: ${fontSize.eyebrow};
  letter-spacing: 1.82px;
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
