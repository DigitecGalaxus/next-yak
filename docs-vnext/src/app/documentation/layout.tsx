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
  display: flex;
  align-items: flex-start;
  max-width: ${maxContentWidth};
  margin: 0 auto;
`;

const Main = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;
