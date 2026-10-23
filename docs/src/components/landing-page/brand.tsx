import { css, styled } from "@yak/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { fonts, fontSize, light, dark } from "@/tokens";
import Yak from "./yak";

/** The logo and the "yak" wordmark, linking home. The header and the menu drawer both show it */
export default function Brand({
  onClick,
  children,
}: {
  onClick?: () => void;
  children?: ReactNode;
}) {
  return (
    <BrandLink href="/" onClick={onClick}>
      <Yak
        css={css`
          width: 32px;
        `}
      />
      <BrandName>yak</BrandName>
      {children}
    </BrandLink>
  );
}

const BrandLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BrandName = styled.span`
  font-family: ${fonts.title};
  font-size: ${fontSize.display};
  letter-spacing: -0.44px;
  color: light-dark(${light.violet}, ${dark.white});

  @media (prefers-reduced-motion: no-preference) {
    transition: color 0.16s ease;
  }

  ${BrandLink}:hover &,
  ${BrandLink}:focus-visible & {
    color: light-dark(${light.red}, ${dark.red});
  }
`;
