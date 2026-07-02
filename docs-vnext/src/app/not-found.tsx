import { styled } from "next-yak";
import CtaButton from "@/components/landing-page/cta-button";
import { light, dark } from "@/tokens";
import { MessagePage, MessageActions } from "@/components/message-page";

export default function NotFound() {
  return (
    <MessagePage>
      <Code>404</Code>
      <Heading>Page not found</Heading>
      <Text>The page you’re looking for doesn’t exist or may have moved.</Text>
      <MessageActions>
        <CtaButton href="/" $primary>
          Back home
        </CtaButton>
        <CtaButton href="/documentation/getting-started">Documentation</CtaButton>
      </MessageActions>
    </MessagePage>
  );
}

const Code = styled.span`
  font-size: 96px;
  line-height: 1;
  color: light-dark(${light.violet}, ${dark.white});
`;

const Heading = styled.h1`
  font-size: 28px;
  color: light-dark(${light.violet}, ${dark.white});
`;

const Text = styled.p`
  max-width: 420px;
  font-size: 16px;
`;
