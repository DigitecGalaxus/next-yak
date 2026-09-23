"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { styled, css } from "next-yak";
import { fontSize, fontWeight, light, dark } from "@/tokens";
import { sectionLabel } from "@/lib/mixins";

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
  display: block;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: ${fontSize.small};
  line-height: 1.4;
  color: light-dark(${light.violetSoft}, ${dark.fog});
  text-decoration: none;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      color 0.12s ease,
      background 0.12s ease;
  }

  &:hover,
  &:focus-visible {
    outline: none;
    color: light-dark(${light.violet}, ${dark.white});
    background: light-dark(${light.beige3}, ${dark.navy3});
  }

  ${({ $active }) =>
    $active &&
    css`
      color: light-dark(${light.violet}, ${dark.white});
      font-weight: ${fontWeight.semibold};
      background: light-dark(${light.beige3}, ${dark.navy3});
    `}
`;
