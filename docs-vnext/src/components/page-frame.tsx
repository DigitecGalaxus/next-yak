import type { ReactNode } from "react";
import { styled } from "next-yak";
import { headerHeight } from "@/tokens";
import Footer from "./landing-page/footer";

/**
 * A page with the site footer under it, resting on the bottom of the window.
 *
 * A short page used to leave the footer floating in the middle with blank space below it.
 * The column fills the window, and the footer takes the space that is left over. A child
 * that should fill the rest can also ask for it with flex: 1 0 auto.
 */
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
  /* the header is sticky, but it still takes its place in the flow, so its height comes off */
  min-height: calc(100dvh - ${headerHeight});
`;

const FooterSlot = styled.div`
  /* takes every pixel the content above does not use, which puts the footer on the bottom */
  margin-top: auto;
`;
