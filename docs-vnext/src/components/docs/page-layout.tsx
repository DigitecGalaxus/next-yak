import type { ReactNode } from "react";
import type { TableOfContents } from "fumadocs-core/toc";
import { styled } from "next-yak";
import { maxContentWidth, screen, headerHeight, light, dark } from "@/tokens";
import { proseStyles } from "@/lib/mixins";
import Toc from "./toc";

export function RailLayout({ rail, children }: { rail: ReactNode; children: ReactNode }) {
  return (
    <Shell>
      <Rail>{rail}</Rail>
      <Main>{children}</Main>
    </Shell>
  );
}

export function ArticleLayout({
  toc,
  reserveToc = false,
  children,
}: {
  toc?: TableOfContents;
  /** Keep the toc column open without a toc, so the content column does not shift. */
  reserveToc?: boolean;
  children: ReactNode;
}) {
  return (
    <Layout>
      <Content>{children}</Content>
      {toc?.length ? (
        <TocRail>
          <TocInner>
            <Toc toc={toc} />
          </TocInner>
        </TocRail>
      ) : reserveToc ? (
        <TocLane aria-hidden />
      ) : null}
    </Layout>
  );
}

export const Title = styled.h1`
  margin-bottom: 4px;
  font-size: 34px;
  line-height: 1.25;
  color: light-dark(${light.violet}, ${dark.white});
`;

export const Description = styled.p`
  margin: 6px 0 4px;
  font-size: 18px;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

export const Prose = styled.div`
  ${proseStyles};
`;

const Shell = styled.div`
  /* The width is explicit because an auto inline margin turns off flex stretch. */
  flex: 1 0 auto;
  width: 100%;
  display: flex;
  align-items: flex-start;
  max-width: ${maxContentWidth};
  margin: 0 auto;
`;

const Rail = styled.aside`
  flex: 0 0 260px;
  position: sticky;
  top: ${headerHeight};
  align-self: flex-start;
  /* max-height, not height: a full-height rail would push the footer down on short pages. */
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

const TocLane = styled.div`
  flex: 0 0 220px;

  @media (max-width: ${screen.toc}) {
    display: none;
  }
`;
