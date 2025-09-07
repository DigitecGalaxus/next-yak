import { styled } from "next-yak";
import Card from "@/components/Card";
import { semantic } from "@/styles/tokens.yak";
import { spacings } from "@/styles/spacings.yak";
import { fontSizes } from "@/styles/font";

export default function PricingPage() {
  return (
    <Container>
      <Title>Pricing</Title>
      <Note>Simple, predictable pricing for projects of any size.</Note>
      <Plans>
        <Card title="Free" description="All essentials to get started. $0/mo" />
        <Card
          title="Pro"
          description="Advanced features for growing teams. $19/mo"
        />
        <Card
          title="Enterprise"
          description="Security and support at scale. Contact us"
        />
      </Plans>
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
const Plans = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${spacings[16]};
`;
const Note = styled.p`
  color: ${semantic.light.mutedFg};

  @media (prefers-color-scheme: dark) {
    color: ${semantic.dark.mutedFg};
  }
`;
