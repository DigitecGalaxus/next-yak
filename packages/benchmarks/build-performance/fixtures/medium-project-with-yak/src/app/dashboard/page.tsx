import { fontSizes } from "@/styles/font";
import { spacings } from "@/styles/spacings.yak";
import { radius, semantic } from "@/styles/tokens.yak";
import { styled } from "next-yak";

export default function DashboardPage() {
  return (
    <Container>
      <h1>Dashboard</h1>
      <Stats>
        <Stat>
          <div>Builds</div>
          <Value>128</Value>
        </Stat>
        <Stat>
          <div>Success</div>
          <Value>99.2%</Value>
        </Stat>
        <Stat>
          <div>Time</div>
          <Value>12m</Value>
        </Stat>
      </Stats>
    </Container>
  );
}

const Container = styled.div`
  padding: ${spacings[24]};
  display: grid;
  gap: ${spacings[16]};
`;
const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: ${spacings[12]};
`;
const Stat = styled.div`
  border: 1px solid ${semantic.light.border};
  border-radius: ${radius.md};
  padding: ${spacings[12]};

  @media (prefers-color-scheme: dark) {
    border-color: ${semantic.dark.border};
  }
`;

const Value = styled.div`
  font-size: ${fontSizes.lg};
  font-weight: 700;
`;
