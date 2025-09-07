import { Meta } from "@/styles/blog";
import { fontSizes } from "@/styles/font";
import { spacings } from "@/styles/spacings.yak";
import { styled } from "next-yak";

export default function BlogPostOne() {
  return (
    <Container>
      <Title>Building a multi-page Next.js example</Title>
      <Meta>2025-09-01 • 3 min read</Meta>
      <Content>
        <p>
          This post demonstrates how multiple pages can reuse shared components
          and styles while keeping each page’s CSS scoped via modules.
        </p>
        <p>
          Marketing pages share a grid/hero stylesheet, while blog pages share a
          list/post stylesheet. Global variables in globals.css provide
          color-scheme and base resets.
        </p>
      </Content>
    </Container>
  );
}

const Container = styled.article`
  padding: ${spacings[24]};
  display: grid;
  gap: ${spacings[12]};
`;

const Title = styled.h1`
  font-size: ${fontSizes.lg};
  font-weight: 700;
`;

const Content = styled.div`
  max-width: 70ch;
  line-height: 1.6;
`;
