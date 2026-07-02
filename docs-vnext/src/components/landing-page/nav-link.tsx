"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { styled, css } from "next-yak";
import { light, dark } from "@/tokens";

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
    color: light-dark(${light.violet}, ${dark.white});
  }

  &:focus-visible {
    outline: none;
    color: light-dark(${light.violet}, ${dark.white});
    text-decoration-line: underline;
  }

  ${({ $active }) =>
    $active &&
    css`
      color: light-dark(${light.violet}, ${dark.white});
      text-decoration-line: underline;
    `}
`;
