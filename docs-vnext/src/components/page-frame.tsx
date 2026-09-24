import type { ReactNode } from "react";
import { styled } from "next-yak";
import { headerHeight } from "@/tokens";
import Footer from "./landing-page/footer";

export default function PageFrame({ children }: { children: ReactNode }) {
  return (
    <Column>
      {children}
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

const FooterSlot = styled.div`
  margin-top: auto;
`;
