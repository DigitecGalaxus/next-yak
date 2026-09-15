import type { Root } from "fumadocs-core/page-tree";
import { styled } from "next-yak";
import { screen, headerHeight } from "@/tokens";
import NavTree from "./nav-tree";

export default function Sidebar({ tree }: { tree: Root }) {
  return (
    <Aside>
      <NavTree tree={tree} />
    </Aside>
  );
}

const Aside = styled.aside`
  flex: 0 0 260px;
  position: sticky;
  top: ${headerHeight};
  align-self: flex-start;
  height: calc(100vh - ${headerHeight});
  overflow-y: auto;
  padding: 28px 16px;

  @media (max-width: ${screen.nav}) {
    display: none;
  }
`;
