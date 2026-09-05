import Link from "next/link";
import type { Item } from "fumadocs-core/page-tree";
import { styled } from "next-yak";
import { fontWeight, light, dark } from "@/tokens";
import { buttonStyles } from "@/components/landing-page/button";

/** Previous / next page links, derived from `findNeighbour(tree, url)`. */
export default function PageFooter({ previous, next }: { previous?: Item; next?: Item }) {
  if (!previous && !next) return null;

  return (
    <Footer>
      {previous ? (
        <PageLink href={previous.url}>
          <Sr>Previous page: </Sr>
          <Arrow aria-hidden>←</Arrow>
          {previous.name}
        </PageLink>
      ) : (
        <span />
      )}
      {next ? (
        <PageLink href={next.url}>
          <Sr>Next page: </Sr>
          {next.name}
          <Arrow aria-hidden>→</Arrow>
        </PageLink>
      ) : (
        <span />
      )}
    </Footer>
  );
}

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 64px;
`;

const PageLink = styled(Link)`
  ${buttonStyles};
  /* A "normal" button — the deeper 4px offset shadow, not the 3px header controls. */
  --btn-offset: 4px;

  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: ${fontWeight.semibold};
  color: light-dark(${light.violet}, ${dark.white});
  text-decoration: none;
`;

const Arrow = styled.span`
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

// Screen-reader-only direction prefix; the arrow alone wouldn't announce anything useful.
const Sr = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
