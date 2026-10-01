"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { css, styled } from "@yak/react";
import { sectionLabel, railLink, railLinkActive } from "@/lib/mixins";

export default function PostNav({ posts }: { posts: { url: string; title: string }[] }) {
  const pathname = usePathname();

  return (
    <nav>
      <Label>posts</Label>
      <List>
        {posts.map((post) => (
          <li key={post.url}>
            <ItemLink href={post.url} $active={pathname === post.url}>
              {post.title}
            </ItemLink>
          </li>
        ))}
      </List>
    </nav>
  );
}

const Label = styled.p`
  ${sectionLabel};
  padding: 0 10px 8px;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 2px;
  list-style: none;
`;

const ItemLink = styled(Link)<{ $active: boolean }>`
  ${railLink};

  /* @yak/react drops a bare mixin returned from a conditional, so wrap it in a css block */
  ${({ $active }) =>
    $active &&
    css`
      ${railLinkActive};
    `}
`;
