import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { styled } from "next-yak";
import { maxContentWidth } from "@/tokens";
import Sidebar from "@/components/docs/sidebar";

export default function DocumentationLayout({ children }: { children: ReactNode }) {
  const tree = source.pageTree;

  return (
    <Shell>
      <Sidebar tree={tree} />
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

const Main = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;
