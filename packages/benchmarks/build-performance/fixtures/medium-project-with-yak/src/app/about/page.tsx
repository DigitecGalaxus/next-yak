import Card from "@/components/Card";
import { fontSizes } from "@/styles/font";
import { Grid, Hero } from "@/styles/marketing";
import { spacings } from "@/styles/spacings.yak";
import { semantic } from "@/styles/tokens.yak";
import { styled } from "next-yak";

export default function AboutPage() {
  return (
    <Container>
      <Hero>
        <Title>About Us</Title>
        <Lead>
          We build fast, accessible, and delightful web experiences. This
          example shows shared styles and components across pages.
        </Lead>
      </Hero>
      <Grid>
        <Card
          title="Mission"
          description="Empower developers with simple, scalable tooling."
        />
        <Card
          title="Values"
          description="Performance, accessibility, and great developer experience."
        />
        <Card
          title="Culture"
          description="Remote-first, async-friendly, and customer-obsessed."
        />
      </Grid>
    </Container>
  );
}

const Container = styled.div`
  padding: ${spacings[24]};
  display: grid;
  gap: ${spacings[16]};
`;

const Title = styled.h1`
  font-size: ${fontSizes.lg};
  font-weight: 700;
`;

const Lead = styled.p`
  color: rgba(0, 0, 0, 0.7);
  max-width: 70ch;

  @media (prefers-color-scheme: dark) {
    color: ${semantic.dark.mutedFg};
  }
`;
