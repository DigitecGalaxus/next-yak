import Card from "@/components/Card";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import { styled } from "next-yak";
import { Grid, Hero, Section } from "@/styles/marketing";
import { semantic } from "@/styles/tokens.yak";
import { fontSizes } from "@/styles/font";
import { spacings } from "@/styles/spacings.yak";

const features = [
  {
    title: "Fast Builds",
    description: "Optimized config with modern Next.js app router.",
  },
  {
    title: "Type Safe",
    description: "TypeScript strict mode with helpful patterns.",
  },
  {
    title: "Shared Styles",
    description: "CSS Modules plus scoped shared style sheets.",
  },
  {
    title: "Reusable UI",
    description: "Simple Card and Nav components used across pages.",
  },
  {
    title: "SEO Ready",
    description: "Metadata and semantic markup out of the box.",
  },
  {
    title: "Dark Mode",
    description: "Respects user color-scheme via CSS variables.",
  },
];

export default function FeaturesPage() {
  return (
    <Container>
      <Hero>
        <Title>Features</Title>
        <GridNote>A sampling of what this example demonstrates.</GridNote>
        <div>
          <Button variant="primary" size="md">
            Get Started
          </Button>
          <span style={{ marginLeft: 8 }} />
          <Button variant="ghost" size="md" href="/pricing">
            See Pricing
          </Button>
        </div>
      </Hero>
      <Grid>
        {features.map((f) => (
          <Card key={f.title} title={f.title} description={f.description} />
        ))}
      </Grid>
      <Section>
        <Alert title="Pro tip" variant="success">
          Use CSS variables to express themes, then consume via modules.
        </Alert>
      </Section>
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

const GridNote = styled.p`
  color: ${semantic.light.mutedFg};

  @media (prefers-color-scheme: dark) {
    color: ${semantic.dark.mutedFg};
  }
`;
