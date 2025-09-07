import { fontSizes } from "@/styles/font";
import { spacings } from "@/styles/spacings.yak";
import { radius, semantic } from "@/styles/tokens.yak";
import { styled } from "next-yak";

export default function TeamCulturePage() {
  return (
    <Container>
      <h1>Team Culture</h1>
      <p>
        Remote-first, async by default, low-meeting culture that values focus
        time.
      </p>
      <Badges>
        <Badge>Remote</Badge>
        <Badge>Flexible</Badge>
        <Badge>Inclusive</Badge>
      </Badges>
    </Container>
  );
}

const Container = styled.div`
  padding: ${spacings[24]};
  display: grid;
  gap: ${spacings[12]};
`;

const Badges = styled.div`
  display: flex;
  gap: ${spacings[8]};
  flex-wrap: wrap;
`;

const Badge = styled.span`
  padding: ${spacings[4]} ${spacings[8]};
  border-radius: ${radius.full};
  border: 1px solid ${semantic.light.border};
  font-size: ${fontSizes.sm};

  @media (prefers-color-scheme: dark) {
    border-color: ${semantic.dark.border};
  }
`;
