import { source } from "@/lib/source";
import { pageMetadata } from "@/lib/page-metadata";
import { findNeighbour } from "fumadocs-core/page-tree";
import { styled } from "next-yak";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { screen, headerHeight, light, dark } from "@/tokens";
import { proseStyles } from "@/lib/prose";
import PageFooter from "@/components/docs/page-footer";
import Toc from "@/components/docs/toc";
import { getMDXComponents } from "@/mdx-components";

type PageProps = { params: Promise<{ slug?: string[] }> };

export default async function DocumentationPage(props: PageProps) {
  const { slug } = await props.params;
  const page = source.getPage(slug?.length ? slug : ["getting-started"]);
  if (!page) notFound();

  const MDX = page.data.body;
  const tree = source.pageTree;
  const { previous, next } = findNeighbour(tree, page.url);

  return (
    <Layout>
      <Content>
        <Title>{page.data.title}</Title>
        {page.data.description ? <Description>{page.data.description}</Description> : null}
        <Prose>
          <MDX components={getMDXComponents({ pageUrl: page.url })} />
        </Prose>
        <PageFooter previous={previous} next={next} />
      </Content>
      {page.data.toc?.length ? (
        <TocRail>
          <TocInner>
            <Toc toc={page.data.toc} />
          </TocInner>
        </TocRail>
      ) : null}
    </Layout>
  );
}

export function generateStaticParams() {
  // `{ slug: [] }` keeps the bare `/docs` route (→ Getting started) in the static export
  return [{ slug: [] as string[] }, ...source.generateParams()];
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const isIndex = !slug?.length;
  const page = source.getPage(isIndex ? ["getting-started"] : slug);
  if (!page) return {};

  // `/docs` duplicates Getting started, so both point at the real URL and its card.
  const file = isIndex ? "getting-started" : slug.join("-");
  return pageMetadata({
    title: page.data.title,
    description: page.data.description,
    path: `/docs/${isIndex ? "getting-started" : slug.join("/")}`,
    card: `docs-${file}`,
  });
}

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

// Typographic styles for rendered MDX. The page title/description sit above this
// block; everything here targets elements produced by the MDX body.
const Prose = styled.div`
  ${proseStyles};
`;
