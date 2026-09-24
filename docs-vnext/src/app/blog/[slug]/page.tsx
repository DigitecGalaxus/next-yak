import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { styled } from "next-yak";
import { blog, formatPostDate } from "@/lib/source";
import { pageMetadata } from "@/lib/page-metadata";
import { chromeLink } from "@/lib/mixins";
import { getMDXComponents } from "@/mdx-components";
import { ArticleLayout, Title, Prose } from "@/components/docs/page-layout";
import { fonts, fontSize, light, dark } from "@/tokens";

type PageProps = { params: Promise<{ slug: string }> };

export default async function BlogPost(props: PageProps) {
  const { slug } = await props.params;
  const post = blog.getPage([slug]);
  if (!post) notFound();

  const MDX = post.data.body;

  return (
    <ArticleLayout toc={post.data.toc}>
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
    </ArticleLayout>
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

const BackLink = styled(Link)`
  ${chromeLink};
  display: inline-block;
  margin-bottom: 14px;
  font-family: ${fonts.mono};
  font-size: 13px;
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
