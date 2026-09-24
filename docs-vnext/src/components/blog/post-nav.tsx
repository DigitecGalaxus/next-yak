"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { css, styled } from "next-yak";
import { sectionLabel } from "@/lib/mixins";
import { railLink, railLinkActive } from "@/lib/link-styles";

export type PostLink = { url: string; title: string };

/**
 * The blog's left rail, the counterpart of the docs nav tree. It answers a pointer the
 * same way that tree does, with a surface and a colour, because both are rows in a list.
 */
export default function PostNav({ posts }: { posts: PostLink[] }) {
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

  /* The conditional has to wrap an inline css block. next-yak compiles the block it can
     see at the call site, so handing it a bare mixin drops the rule. */
  ${({ $active }) =>
    $active &&
    css`
      ${railLinkActive};
    `}
`;
