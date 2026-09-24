import Link from "next/link";
import type { Metadata } from "next";
import { styled } from "next-yak";
import { getPostsNewestFirst, formatPostDate } from "@/lib/source";
import { pageMetadata } from "@/lib/page-metadata";
import { ArticleLayout, Title, Description } from "@/components/docs/page-layout";
import { fonts, fontSize, fontWeight, light, dark } from "@/tokens";

const description = "Notes on yak: the rename, the runtimes, and what is coming.";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description,
  path: "/blog",
  card: "blog",
});

export default function BlogIndex() {
  return (
    <ArticleLayout reserveToc>
      <Title>Blog</Title>
      <Description>{description}</Description>
      <List>
        {getPostsNewestFirst().map((post) => (
          <li key={post.url}>
            <PostLink href={post.url}>
              <PostMeta>
                <time dateTime={post.data.date}>{formatPostDate(post.data.date)}</time>
                {post.data.author ? <> · {post.data.author}</> : null}
              </PostMeta>
              <PostTitle>{post.data.title}</PostTitle>
              {post.data.description ? <PostBlurb>{post.data.description}</PostBlurb> : null}
            </PostLink>
          </li>
        ))}
      </List>
    </ArticleLayout>
  );
}

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 36px;
  padding: 0;
  list-style: none;
`;

const PostLink = styled(Link)`
  display: block;
  padding: 14px 16px;
  margin-inline: -16px;
  border-radius: 12px;
  text-decoration: none;

  @media (prefers-reduced-motion: no-preference) {
    transition: background 0.14s ease;
  }

  &:hover,
  &:focus-visible {
    outline: none;
    background: light-dark(${light.beige3}, ${dark.navy3});
  }
`;

const PostMeta = styled.span`
  display: block;
  margin-bottom: 2px;
  font-family: ${fonts.mono};
  font-size: 13px;
  letter-spacing: 0.3px;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

const PostTitle = styled.span`
  display: block;
  font-size: ${fontSize.h3};
  font-weight: ${fontWeight.bold};
  color: light-dark(${light.violet}, ${dark.white});
`;

const PostBlurb = styled.span`
  display: block;
  margin-top: 4px;
  font-size: ${fontSize.small};
  line-height: 1.5;
`;
