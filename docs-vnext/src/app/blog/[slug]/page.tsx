import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { styled } from "next-yak";
import { blog } from "@/lib/blog";
import { pageMetadata } from "@/lib/page-metadata";
import { chromeLink } from "@/lib/link-styles";
import { formatPostDate } from "@/lib/blog-date";
import { getMDXComponents } from "@/mdx-components";
import Toc from "@/components/docs/toc";
import { proseStyles } from "@/lib/prose";
import { fonts, fontSize, screen, headerHeight, light, dark } from "@/tokens";

type PageProps = { params: Promise<{ slug: string }> };

export default async function BlogPost(props: PageProps) {
  const { slug } = await props.params;
  const post = blog.getPage([slug]);
  if (!post) notFound();

  const MDX = post.data.body;

  return (
    <Layout>
      <Content>
        <BackLink href="/blog">← Blog</BackLink>
        <Title>{post.data.title}</Title>
        <Meta>
          <time dateTime={post.data.date}>{formatPostDate(post.data.date)}</time>
          {post.data.author ? <> · {post.data.author}</> : null}
        </Meta>
        {post.data.description ? <Description>{post.data.description}</Description> : null}
        <Prose>
          <MDX components={getMDXComponents({ pageUrl: post.url })} />
        </Prose>
      </Content>
      {post.data.toc?.length ? (
        <TocRail>
          <TocInner>
            <Toc toc={post.data.toc} />
          </TocInner>
        </TocRail>
      ) : null}
    </Layout>
  );
}

export function generateStaticParams() {
  return blog.generateParams().map(({ slug }) => ({ slug: (slug ?? []).join("/") }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const post = blog.getPage([slug]);
  if (!post) return {};
  return pageMetadata({
    title: post.data.title,
    description: post.data.description,
    path: `/blog/${slug}`,
    card: `blog-${slug}`,
    publishedTime: post.data.date,
  });
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

const Content = styled.article`
  container: prose / inline-size;

  flex: 1 1 auto;
  min-width: 0;
  max-width: 768px;
  line-height: 1.7;
`;

const BackLink = styled(Link)`
  ${chromeLink};
  display: inline-block;
  margin-bottom: 14px;
  font-family: ${fonts.mono};
  font-size: 13px;
`;

const Title = styled.h1`
  margin-bottom: 4px;
  font-size: 34px;
  line-height: 1.25;
  color: light-dark(${light.violet}, ${dark.white});
`;

const Meta = styled.p`
  margin: 8px 0 0;
  font-family: ${fonts.mono};
  font-size: 13px;
  letter-spacing: 0.3px;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

const Description = styled.p`
  margin: 10px 0 4px;
  font-size: ${fontSize.h3};
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

const Prose = styled.div`
  ${proseStyles};
`;

const TocRail = styled.aside`
  flex: 0 0 220px;
  position: sticky;
  top: calc(${headerHeight} + 24px);
  align-self: flex-start;
  max-height: calc(100vh - ${headerHeight} - 48px);
  overflow-y: auto;

  @media (max-width: ${screen.toc}) {
    display: none;
  }
`;

const TocInner = styled.div`
  padding-top: 8px;
`;
