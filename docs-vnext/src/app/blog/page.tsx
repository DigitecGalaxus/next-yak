import Link from "next/link";
import type { Metadata } from "next";
import { styled } from "next-yak";
import { blog } from "@/lib/blog";
import { pageMetadata } from "@/lib/page-metadata";
import { formatPostDate } from "@/lib/blog-date";
import { fonts, fontSize, fontWeight, screen, light, dark } from "@/tokens";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Notes on yak: the rename, the runtimes, and what is coming.",
  path: "/blog",
  card: "blog",
});

export default function BlogIndex() {
  // newest first. `date` is required by the schema, so every post has one to sort by.
  const posts = [...blog.getPages()].sort((a, b) => b.data.date.localeCompare(a.data.date));

  return (
    <Layout>
      <Content>
        <Title>Blog</Title>
        <Description>Notes on yak: the rename, the runtimes, and what is coming.</Description>
        <List>
          {posts.map((post) => (
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
      </Content>
      {/* The post beside this page carries a table of contents. Without the same lane
          held open here, the column jumps 138px left the moment a reader opens a post. */}
      <TocLane aria-hidden />
    </Layout>
  );
}

/* the column geometry of a docs page, so the two read as one site */
const Layout = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 56px;
  padding: 40px 48px 96px;

  @media (max-width: ${screen.nav}) {
    padding: 24px 24px 80px;
  }
`;

const Content = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  max-width: 768px;
  line-height: 1.7;
`;

const TocLane = styled.div`
  flex: 0 0 220px;

  @media (max-width: ${screen.toc}) {
    display: none;
  }
`;

const Title = styled.h1`
  margin-bottom: 4px;
  font-size: 34px;
  line-height: 1.25;
  color: light-dark(${light.violet}, ${dark.white});
`;

const Description = styled.p`
  margin: 6px 0 4px;
  font-size: 18px;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 36px;
  padding: 0;
  list-style: none;
`;

/* A row in a list, so it answers a pointer with a surface, the way the rail beside it does. */
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
