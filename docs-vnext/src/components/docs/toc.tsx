"use client";

import { AnchorProvider, TOCItem } from "fumadocs-core/toc";
import type { TableOfContents } from "fumadocs-core/toc";
import { styled } from "next-yak";
import { colors } from "@/tokens";
import { sectionLabel } from "@/lib/mixins";

/**
 * On-page table of contents. `AnchorProvider` (fumadocs-core) wires the
 * intersection-observer that tracks the active heading; `TOCItem` reflects it
 * via a `data-active` attribute that we style.
 */
export default function Toc({ toc }: { toc: TableOfContents }) {
  if (!toc || toc.length === 0) return null;

  return (
    <AnchorProvider toc={toc}>
      <Heading>On this page</Heading>
      <List>
        {toc.map((item) => (
          <Item key={item.url} href={item.url} $depth={item.depth}>
            {item.title}
          </Item>
        ))}
      </List>
    </AnchorProvider>
  );
}

const Heading = styled.span`
  ${sectionLabel};
  display: block;
  margin-bottom: 10px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  border-left: 2px solid ${colors.beigeDark};
`;

const Item = styled(TOCItem)<{ $depth: number }>`
  display: block;
  margin-left: -2px;
  padding: 3px 0 3px 12px;
  padding-left: calc(12px + ${({ $depth }) => Math.max(0, $depth - 2) * 12}px);
  border-left: 2px solid transparent;
  font-size: 13px;
  line-height: 1.4;
  color: ${colors.violetLight};
  text-decoration: none;

  @media (prefers-reduced-motion: no-preference) {
    transition: color 0.12s ease;
  }

  &:hover {
    color: ${colors.violet};
  }

  &[data-active="true"] {
    color: ${colors.violet};
    border-left-color: ${colors.violet};
  }
`;
