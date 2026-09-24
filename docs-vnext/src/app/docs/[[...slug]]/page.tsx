import { source } from "@/lib/source";
import { pageMetadata } from "@/lib/page-metadata";
import { findNeighbour } from "fumadocs-core/page-tree";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageFooter from "@/components/docs/page-footer";
import { ArticleLayout, Title, Description, Prose } from "@/components/docs/page-layout";
import { getMDXComponents } from "@/mdx-components";

type PageProps = { params: Promise<{ slug?: string[] }> };

const indexSlug = ["getting-started"];

export default async function DocumentationPage(props: PageProps) {
  const { slug } = await props.params;
  const page = source.getPage(slug?.length ? slug : indexSlug);
  if (!page) notFound();

  const MDX = page.data.body;
  const { previous, next } = findNeighbour(source.pageTree, page.url);

  return (
    <ArticleLayout toc={page.data.toc}>
      <Title>{page.data.title}</Title>
      {page.data.description ? <Description>{page.data.description}</Description> : null}
      <Prose>
        <MDX components={getMDXComponents({ pageUrl: page.url })} />
      </Prose>
      <PageFooter previous={previous} next={next} />
    </ArticleLayout>
  );
}

export function generateStaticParams() {
  // `{ slug: [] }` keeps the bare `/docs` route in the static export
  return [{ slug: [] as string[] }, ...source.generateParams()];
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await props.params;
  // `/docs` duplicates Getting started, so both point at its URL and card
  const slug = rawSlug?.length ? rawSlug : indexSlug;
  const page = source.getPage(slug);
  if (!page) return {};

  return pageMetadata({
    title: page.data.title,
    description: page.data.description,
    path: `/docs/${slug.join("/")}`,
    card: `docs-${slug.join("-")}`,
  });
}
