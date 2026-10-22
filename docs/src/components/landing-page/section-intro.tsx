import { styled } from "@yak/react";
import type { CSSProperties, ReactNode } from "react";
import { fontWeight, light, dark } from "@/tokens";

export default function SectionIntro({
  title,
  className,
  style,
  children,
}: {
  title: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <Wrap className={className} style={style}>
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

export const SubHeading = styled.p`
  line-height: 24px;
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
`;
