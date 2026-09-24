"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { styled, css } from "next-yak";
import { light, dark } from "@/tokens";
import { externalLinkProps } from "@/lib/external-link";
import ExternalMark from "@/components/external-mark";
import { chromeLink } from "@/lib/mixins";

export default function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <StyledNavLink href={href} $active={isActive} onClick={onClick}>
      {children}
    </StyledNavLink>
  );
}

export function NavExternalLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <StyledExternalLink href={href} {...externalLinkProps} onClick={onClick}>
      {children}
      <ExternalMark />
    </StyledExternalLink>
  );
}

const navLinkStyles = css`
  ${chromeLink};
  text-underline-offset: 6px;
  text-decoration-thickness: 2px;
`;

/* Must come after the active rule, so the active link still reacts to hover. */
const navLinkHover = css`
  ${chromeLink};

  &:focus-visible {
    outline: none;
    text-decoration-line: underline;
  }
`;

const StyledNavLink = styled(Link)<{ $active: boolean }>`
  ${navLinkStyles};

  ${({ $active }) =>
    $active &&
    css`
      color: light-dark(${light.violet}, ${dark.white});
      text-decoration-line: underline;
    `}

  ${navLinkHover};
`;

const StyledExternalLink = styled.a`
  ${navLinkStyles};
  ${navLinkHover};
`;
