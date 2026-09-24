"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { styled, css } from "next-yak";
import { light, dark } from "@/tokens";
import { externalLinkProps } from "@/lib/external-link";
import ExternalMark from "@/components/external-mark";
import { chromeLink } from "@/lib/link-styles";

export default function NavLink({
  href,
  children,
  className,
  style,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <StyledNavLink
      href={href}
      $active={isActive}
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </StyledNavLink>
  );
}

/**
 * A link off the site, styled as a top-bar entry. It carries no active state, because no
 * route ever matches it. The arrow says where the click goes before the click: Benchmarks
 * sits in a row of four words, and it is the only one that leaves the site.
 */
export function NavExternalLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <StyledExternalLink href={href} {...externalLinkProps} className={className} onClick={onClick}>
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

/* The hover comes after the active rule on purpose. It sat before it, so the active link
   answered a pointer with nothing: it already carried the colour the hover asked for. */
const navLinkHover = css`
  ${chromeLink};

  &:focus-visible {
    outline: none;
    text-decoration-line: underline;
  }
`;

const StyledNavLink = styled(Link)<{ $active: boolean }>`
  ${navLinkStyles};

  /* the active page keeps the violet and the underline that mark it */
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
