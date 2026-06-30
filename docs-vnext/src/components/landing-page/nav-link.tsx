"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { styled, css } from "next-yak";
import { colors } from "@/tokens";

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

const StyledNavLink = styled(Link)<{ $active: boolean }>`
  text-decoration: none;
  text-underline-offset: 6px;
  text-decoration-thickness: 2px;

  @media (prefers-reduced-motion: no-preference) {
    transition: color 0.15s ease;
  }

  &:hover {
    color: ${colors.violet};
  }

  &:focus-visible {
    outline: none;
    color: ${colors.violet};
    text-decoration-line: underline;
  }

  ${({ $active }) =>
    $active &&
    css`
      color: ${colors.violet};
      text-decoration-line: underline;
    `}
`;
