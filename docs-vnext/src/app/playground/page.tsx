import type { Metadata } from "next";
import { styled } from "next-yak";
import CtaButton from "@/components/landing-page/cta-button";
import { light, dark } from "@/tokens";
import { MessagePage, MessageActions } from "@/components/message-page";
import { overline } from "@/lib/mixins";

export const metadata: Metadata = {
  title: "Playground",
  description: "An interactive yak playground is on the way.",
};

export default function PlaygroundPage() {
  return (
    <MessagePage>
      <Eyebrow>Playground</Eyebrow>
      <Heading>Coming soon</Heading>
      <Text>
        An interactive playground is on the way. Until then, the docs cover the full API end to end.
      </Text>
      <MessageActions>
        <CtaButton href="/documentation/getting-started" $primary>
          Read the docs
        </CtaButton>
        <CtaButton href="https://github.com/digitecgalaxus/next-yak">GitHub</CtaButton>
      </MessageActions>
    </MessagePage>
  );
}

const Eyebrow = styled.span`
  ${overline};
  font-size: 13px;
  letter-spacing: 0.6px;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

const Heading = styled.h1`
  font-size: 40px;
  line-height: 1.1;
  color: light-dark(${light.violet}, ${dark.white});
`;

const Text = styled.p`
  max-width: 480px;
  font-size: 16px;
  line-height: 1.6;
`;
