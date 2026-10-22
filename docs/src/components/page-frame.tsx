import type { ReactNode } from "react";
import { styled } from "@yak/react";
import { headerHeight } from "@/tokens";
import Footer from "./landing-page/footer";

export default function PageFrame({ children }: { children: ReactNode }) {
  return (
    <Column>
      <Main>{children}</Main>
      <FooterSlot>
        <Footer />
      </FooterSlot>
    </Column>
  );
}

const Column = styled.div`
  display: flex;
  flex-direction: column;
  /* the sticky header still takes space in the flow */
  min-height: calc(100dvh - ${headerHeight});
`;

// The one main landmark of each page. A flex column, so a page can still grow to fill the
// space above the footer.
const Main = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
`;

const FooterSlot = styled.div`
  margin-top: auto;
`;
