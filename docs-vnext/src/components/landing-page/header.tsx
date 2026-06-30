import { css, styled } from "next-yak";
import type { CSSProperties } from "react";
import Search from "./search";
import ThemeToggle from "./theme-toggle";
import ButtonLink from "./button-link";
import Link from "next/link";
import NavLink from "./nav-link";
import MobileMenu from "./mobile-menu";
import { source } from "@/lib/source";
import { asset } from "@/lib/site";
import { screen, colors, fonts, headerHeight, maxContentWidth, typography } from "@/tokens";
import Image from "next/image";
import Yak from "./yak";

export default function Header({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <header
      className={className}
      style={style}
      css={css`
        /* full-width bar; the content inside caps and centers to align with the page */
        display: flex;
        justify-content: center;
        min-height: ${headerHeight};
        border-bottom: 2px solid ${colors.violet};
        /* sticky so search/nav stay reachable; the docs sidebar + TOC already pin at
           top:72/96px expecting this. Translucent + blur lets content scroll under it. */
        position: sticky;
        top: 0;
        z-index: 40;
        background: light-dark(rgba(248, 245, 242, 0.82), rgba(20, 16, 25, 0.82));
        backdrop-filter: blur(10px);
        /* a container so the nav collapses based on the bar's own width (see MobileMenu) */
        container: header / inline-size;
      `}
    >
      <div
        css={css`
          display: flex;
          flex: 1;
          max-width: ${maxContentWidth};
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(20px, 5vw, 48px);
        `}
      >
        <nav
          css={css`
            display: flex;
            align-items: center;
            gap: 28px;
          `}
        >
          <Link
            href="/"
            css={css`
              display: flex;
              align-items: center;
              gap: 8px;
            `}
          >
            <Yak
              css={css`
                width: 32px;
              `}
            />
            <span
              css={css`
                font-family: ${fonts.title};
                font-size: ${typography.display};
                letter-spacing: -0.44px;
                color: ${colors.violet};
              `}
            >
              yak
            </span>
          </Link>
          <DesktopLinks>
            <NavLink href="/documentation/getting-started">Documentation</NavLink>
            <NavLink href="/playground">Playground</NavLink>
          </DesktopLinks>
        </nav>
        <DesktopActions>
          <Search />
          <ThemeToggle />
          <ButtonLink href="https://github.com/digitecgalaxus/next-yak">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.87208 2.55446e-05C6.00265 0.000721894 4.19444 0.666438 2.77084 1.87811C1.34725 3.08978 0.401123 4.76837 0.101692 6.61366C-0.19774 8.45896 0.169049 10.3506 1.13646 11.9502C2.10387 13.5499 3.6088 14.7532 5.38208 15.345C5.77958 15.42 5.92208 15.1725 5.92208 14.97V13.5075C3.72458 13.98 3.25958 12.57 3.25958 12.57C2.89958 11.655 2.38208 11.4075 2.38208 11.4075C1.66208 10.92 2.43458 10.9275 2.43458 10.9275C3.22958 10.98 3.64958 11.745 3.64958 11.745C4.35458 12.945 5.49458 12.6 5.94458 12.3975C6.01958 11.8875 6.22208 11.5425 6.44708 11.3475C4.69208 11.145 2.84708 10.47 2.84708 7.44753C2.84708 6.58503 3.15458 5.88003 3.65708 5.32503C3.57458 5.12253 3.30458 4.32003 3.73208 3.22503C3.73208 3.22503 4.39208 3.01503 5.89208 4.03503C7.1788 3.6857 8.53537 3.6857 9.82208 4.03503C11.3221 3.01503 11.9821 3.22503 11.9821 3.22503C12.4096 4.32003 12.1396 5.12253 12.0571 5.32503C12.5671 5.88003 12.8671 6.58503 12.8671 7.44753C12.8671 10.4775 11.0221 11.145 9.25958 11.34C9.54458 11.5875 9.79208 12.0675 9.79208 12.81V14.985C9.79208 15.195 9.93458 15.4425 10.3396 15.36C12.1222 14.7771 13.6383 13.5772 14.615 11.976C15.5917 10.3749 15.9649 8.47772 15.6674 6.62594C15.37 4.77416 14.4213 3.08934 12.9923 1.87467C11.5633 0.660008 9.7476 -0.00474929 7.87208 2.55446e-05Z"
                fill="currentColor"
              />
            </svg>
          </ButtonLink>
        </DesktopActions>
        <MobileMenu tree={source.pageTree} />
      </div>
    </header>
  );
}

const DesktopLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;

  @container header (max-width: ${screen.nav}) {
    display: none;
  }
`;

const DesktopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  @container header (max-width: ${screen.nav}) {
    display: none;
  }
`;
