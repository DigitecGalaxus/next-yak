import { spacings } from "@/styles/spacings.yak";
import { radius, semantic } from "@/styles/tokens.yak";
import { styled } from "next-yak";

const roles = [
  { title: "Senior Frontend Engineer", location: "Remote" },
  { title: "Product Designer", location: "Remote" },
  { title: "Developer Advocate", location: "Remote" },
];

export default function CareersPage() {
  return (
    <Container>
      <h1>Careers</h1>
      <List>
        {roles.map((r) => (
          <Item key={r.title}>
            <strong>{r.title}</strong>
            <div>{r.location}</div>
          </Item>
        ))}
      </List>
    </Container>
  );
}

const Container = styled.div`
  padding: ${spacings[24]};
  display: grid;
  gap: ${spacings[16]};
`;

const List = styled.div`
  display: grid;
  gap: ${spacings[12]};
`;

const Item = styled.div`
  padding: ${spacings[12]};
  border: 1px solid ${semantic.light.border};
  border-radius: ${radius.md};

  @media (prefers-color-scheme: dark) {
    border-color: ${semantic.dark.border};
  }
`;
