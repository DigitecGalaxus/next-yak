"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Node, Root } from "fumadocs-core/page-tree";
import { css, styled } from "next-yak";
import { light, dark } from "@/tokens";
import { sectionLabel, railLink, railLinkActive } from "@/lib/mixins";
import { externalLinkProps, isExternalHref } from "@/lib/external-link";

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
  // fumadocs leaves `external` unset on markdown link items in meta.json
  if (node.external || isExternalHref(node.url)) {
    return (
      <ExternalItemLink href={node.url} {...externalLinkProps} onClick={onNavigateAction}>
        {node.name}
      </ExternalItemLink>
    );
  }

  return (
    <ItemLink href={node.url} $active={pathname === node.url} onClick={onNavigateAction}>
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
  border-left: 2px solid light-dark(${light.beige3}, ${dark.navy3});
`;

const ItemLink = styled(Link)<{ $active?: boolean }>`
  ${railLink};

  /* next-yak drops a bare mixin returned from a conditional, so wrap it in a css block */
  ${({ $active }) =>
    $active &&
    css`
      ${railLinkActive};
    `}
`;

const ExternalItemLink = styled.a`
  ${railLink};
`;
