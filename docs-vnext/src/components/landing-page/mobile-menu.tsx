"use client";

import { Dialog } from "@base-ui-components/react/dialog";
import { usePathname } from "next/navigation";
import type { Root } from "fumadocs-core/page-tree";
import { useEffect, useState } from "react";
import { css, styled } from "next-yak";
import { screen, colors } from "@/tokens";
import { iconButton } from "./button";
import { backdropStyles } from "@/lib/mixins";
import NavLink from "./nav-link";
import Search from "./search";
import ThemeToggle from "./theme-toggle";
import NavTree from "../docs/nav-tree";

/**
 * The site's single mobile navigation. A hamburger in the header opens a base-ui
 * Dialog drawer holding the primary links, search + theme, and — on docs routes —
 * the documentation page tree. Hidden on desktop, where the header bar and the
 * sticky sidebar take over. This replaces the old docs-only MobileNav so there is
 * only ever one level of navigation on small screens.
 */
export default function MobileMenu({ tree }: { tree: Root }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  // A completed navigation changes the pathname; close the drawer when it does.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Bar>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Trigger aria-label="Open menu">
          <MenuIcon />
        </Trigger>
        <Dialog.Portal>
          <Backdrop />
          <Drawer>
            <Dialog.Title
              css={css`
                margin-bottom: 18px;
                font-size: 18px;
                color: ${colors.violet};
              `}
            >
              Menu
            </Dialog.Title>

            <Search fullWidth onClick={close} />

            <PrimaryNav>
              <Section>
                <NavLink href="/documentation/getting-started" onClick={close}>
                  Documentation
                </NavLink>
                {pathname.startsWith("/documentation") && (
                  <SubNav>
                    <NavTree tree={tree} onNavigateAction={close} />
                  </SubNav>
                )}
              </Section>
              <NavLink href="/playground" onClick={close}>
                Playground
              </NavLink>
              <ExternalLink
                href="https://github.com/digitecgalaxus/next-yak"
                target="_blank"
                rel="noreferrer"
                onClick={close}
              >
                GitHub
              </ExternalLink>
            </PrimaryNav>

            <ThemeFoot>
              <ThemeToggle showLabel />
            </ThemeFoot>
          </Drawer>
        </Dialog.Portal>
      </Dialog.Root>
    </Bar>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 4h12M2 8h12M2 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Only present on narrow screens. The container query matches the one the header
// uses to hide its desktop nav, so the bar and the drawer trigger swap in at
// exactly the same width.
const Bar = styled.div`
  display: none;

  @container header (max-width: ${screen.nav}) {
    display: flex;
    align-items: center;
  }
`;

const Trigger = styled(Dialog.Trigger)`
  ${iconButton};
  color: ${colors.violet};
`;

const Backdrop = styled(Dialog.Backdrop)`
  ${backdropStyles};
  z-index: 60;

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity 0.25s ease;
  }

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
  }
`;

const Drawer = styled(Dialog.Popup)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 61;
  display: flex;
  flex-direction: column;
  width: min(320px, 82vw);
  height: 100dvh;
  overflow-y: auto;
  padding: 24px 18px;
  background: ${colors.beige};
  border-right: 2.5px solid ${colors.violet};

  @media (prefers-reduced-motion: no-preference) {
    transition: transform 0.25s ease;
  }

  &[data-starting-style],
  &[data-ending-style] {
    transform: translateX(-100%);
  }

  &:focus-visible {
    outline: none;
  }
`;

const PrimaryNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 20px;
  font-size: 16px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SubNav = styled.div`
  margin-left: 4px;
  padding-left: 10px;
  border-left: 2px solid ${colors.beigeDark};
`;

const ExternalLink = styled.a`
  color: ${colors.violetLight};
  text-decoration: none;

  @media (prefers-reduced-motion: no-preference) {
    transition: color 0.15s ease;
  }

  &:hover {
    color: ${colors.violet};
  }
`;

// Pinned to the bottom of the drawer (margin-top: auto) when content is short;
// flows after the nav and scrolls into view when the docs tree makes it tall.
const ThemeFoot = styled.div`
  margin-top: auto;
  padding-top: 18px;
`;
