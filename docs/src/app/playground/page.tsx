import type { Metadata } from "next";
import { styled } from "@yak/react";
import { PlaygroundLoader } from "@/components/playground/playground-loader";
import { pageMetadata } from "@/lib/page-metadata";
import { overline } from "@/lib/mixins";
import { light, dark, headerHeight, maxContentWidth, screen } from "@/tokens";

export const metadata: Metadata = pageMetadata({
  title: "Playground",
  description:
    "Write yak styled components in the browser and see the preview, the extracted CSS and the compiled JavaScript as you type.",
  path: "/playground",
  card: "playground",
});

export default function PlaygroundPage() {
  return (
    <Page>
      <Intro>
        <Eyebrow>Playground</Eyebrow>
        <Title>Try yak in your browser</Title>
        <Lead>
          Edit the code. The preview and the compiled CSS update as you type. The compiler is the
          real yak SWC plugin, built to WebAssembly, and it runs on your machine.
        </Lead>
      </Intro>
      <PlaygroundLoader />
    </Page>
  );
}

const Page = styled.main`
  box-sizing: border-box;
  width: 100%;
  max-width: ${maxContentWidth};
  margin: 0 auto;
  padding: 40px 48px 80px;

  @media (max-width: ${screen.nav}) {
    padding: 24px 16px 64px;
  }

  /* wide screens give the room to the editor and the preview: the page fills the window
     below the site header, and the playground takes what the intro leaves */
  @media (min-width: ${screen.toc}) {
    display: flex;
    flex-direction: column;
    height: calc(100dvh - ${headerHeight});
    min-height: 640px;
    max-width: none;
    padding: 20px 32px 24px;
  }
`;

const Intro = styled.div`
  margin-bottom: 28px;

  @media (min-width: ${screen.toc}) {
    margin-bottom: 16px;
  }
`;

const Eyebrow = styled.span`
  ${overline};
  font-size: 13px;
  letter-spacing: 0.6px;
  color: light-dark(${light.red}, ${dark.red});

  @media (min-width: ${screen.toc}) {
    display: none;
  }
`;

const Title = styled.h1`
  margin: 6px 0 8px;
  font-size: 34px;
  line-height: 1.2;
  color: light-dark(${light.violet}, ${dark.white});

  @media (min-width: ${screen.toc}) {
    margin: 0 0 4px;
  }
`;

const Lead = styled.p`
  max-width: 620px;
  margin: 0;
  font-size: 17px;
  line-height: 1.6;

  @media (min-width: ${screen.toc}) {
    max-width: none;
  }
`;
