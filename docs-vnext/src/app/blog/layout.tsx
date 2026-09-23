import type { ReactNode } from "react";
import { styled } from "next-yak";
import { blog } from "@/lib/blog";
import { maxContentWidth, screen, headerHeight } from "@/tokens";
import PostNav from "@/components/blog/post-nav";

/**
 * The same shell as the docs: a sticky rail on the left, the page beside it. The rail
 * lists the posts, where the docs rail lists the page tree.
 */
export default function BlogLayout({ children }: { children: ReactNode }) {
  const posts = [...blog.getPages()]
    .sort((a, b) => b.data.date.localeCompare(a.data.date))
    .map((post) => ({ url: post.url, title: post.data.title }));

  return (
    <Shell>
      <Aside>
        <PostNav posts={posts} />
      </Aside>
      <Main>{children}</Main>
    </Shell>
  );
}

const Shell = styled.div`
  /* grows, so the footer below it sits at the bottom of a short page. The width is
     explicit: an auto inline margin turns off the stretch a flex item would otherwise get. */
  flex: 1 0 auto;
  width: 100%;
  display: flex;
  align-items: flex-start;
  max-width: ${maxContentWidth};
  margin: 0 auto;
`;

const Aside = styled.aside`
  flex: 0 0 260px;
  position: sticky;
  top: ${headerHeight};
  align-self: flex-start;
  /* max-height, not height: a full-viewport rail sets the floor for the flex row, so a
     short page left an empty band between its content and the footer. Capped this way the
     rail is as tall as its list and still scrolls when the list is longer. */
  max-height: calc(100vh - ${headerHeight});
  overflow-y: auto;
  padding: 28px 16px;

  @media (max-width: ${screen.nav}) {
    display: none;
  }
`;

const Main = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;
