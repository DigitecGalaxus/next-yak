"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Node, Root } from "fumadocs-core/page-tree";
import { css, styled } from "next-yak";
import { colors, fontSize, fontWeight } from "@/tokens";
import { sectionLabel } from "@/lib/mixins";

export default function NavTree({
  tree,
  onNavigateAction,
}: {
  tree: Root;
  onNavigateAction?: () => void;
}) {
  const pathname = usePathname();
  return (
    <Nav aria-label="Documentation">
      {tree.children.map((node, i) => (
        <NavNode
          key={node.$id ?? i}
          node={node}
          pathname={pathname}
          onNavigateAction={onNavigateAction}
        />
      ))}
    </Nav>
  );
}

function NavNode({
  node,
  pathname,
  onNavigateAction,
}: {
  node: Node;
  pathname: string;
  onNavigateAction?: () => void;
}) {
  if (node.type === "separator") {
    return <SectionLabel>{node.name}</SectionLabel>;
  }

  if (node.type === "folder") {
    return (
      <Folder>
        {node.index ? (
          <PageLink node={node.index} pathname={pathname} onNavigateAction={onNavigateAction} />
        ) : (
          <SectionLabel>{node.name}</SectionLabel>
        )}
        <FolderChildren>
          {node.children.map((child, i) => (
            <NavNode
              key={child.$id ?? i}
              node={child}
              pathname={pathname}
              onNavigateAction={onNavigateAction}
            />
          ))}
        </FolderChildren>
      </Folder>
    );
  }

  return <PageLink node={node} pathname={pathname} onNavigateAction={onNavigateAction} />;
}

function PageLink({
  node,
  pathname,
  onNavigateAction,
}: {
  node: Extract<Node, { type: "page" }>;
  pathname: string;
  onNavigateAction?: () => void;
}) {
  if (node.external) {
    return (
      <ExternalItemLink href={node.url} target="_blank" rel="noreferrer" onClick={onNavigateAction}>
        {node.name}
      </ExternalItemLink>
    );
  }

  const active = pathname === node.url;
  return (
    <ItemLink href={node.url} $active={active} onClick={onNavigateAction}>
      {node.name}
    </ItemLink>
  );
}

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SectionLabel = styled.span`
  ${sectionLabel};
  margin: 18px 0 6px;
  padding: 0 10px;

  &:first-child {
    margin-top: 0;
  }
`;

const Folder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FolderChildren = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 10px;
  padding-left: 8px;
  border-left: 2px solid ${colors.beigeDark};
`;

const itemLinkStyles = css`
  padding: 6px 10px;
  border-radius: 8px;
  font-size: ${fontSize.small};
  color: ${colors.violetLight};
  text-decoration: none;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      color 0.12s ease,
      background 0.12s ease;
  }

  &:hover {
    color: ${colors.violet};
    background: ${colors.beigeDark};
  }

  &:focus-visible {
    outline: none;
    color: ${colors.violet};
    background: ${colors.beigeDark};
  }
`;

const ItemLink = styled(Link)<{ $active?: boolean }>`
  ${itemLinkStyles};

  ${({ $active }) =>
    $active &&
    css`
      color: ${colors.violet};
      font-weight: ${fontWeight.semibold};
      background: ${colors.beigeDark};
    `}
`;

const ExternalItemLink = styled.a`
  ${itemLinkStyles};
`;
