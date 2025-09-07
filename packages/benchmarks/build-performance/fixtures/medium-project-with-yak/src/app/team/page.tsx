import { fontSizes } from "@/styles/font";
import { spacings } from "@/styles/spacings.yak";
import { radius, semantic } from "@/styles/tokens.yak";
import { styled } from "next-yak";

const members = [
  { name: "Ari", role: "Engineering" },
  { name: "Bea", role: "Design" },
  { name: "Chen", role: "Product" },
  { name: "Drew", role: "DX" },
];

export default function TeamPage() {
  return (
    <Container>
      <h1>Team</h1>
      <Grid>
        {members.map((m) => (
          <Card key={m.name}>
            <strong>{m.name}</strong>
            <Role>{m.role}</Role>
          </Card>
        ))}
      </Grid>
    </Container>
  );
}

const Container = styled.div`
  padding: ${spacings[24]};
  display: grid;
  gap: ${spacings[16]};
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${spacings[16]};
`;
const Card = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: ${radius.lg};
  padding: ${spacings[12]};

  @media (prefers-color-scheme: dark) {
    border-color: rgba(255, 255, 255, 0.12);
  }
`;
const Role = styled.div`
  color: ${semantic.light.mutedFg};
  font-size: ${fontSizes.sm};

  @media (prefers-color-scheme: dark) {
    color: ${semantic.dark.mutedFg};
  }
`;
