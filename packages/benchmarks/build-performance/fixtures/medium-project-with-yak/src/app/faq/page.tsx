import { spacings } from "@/styles/spacings.yak";
import { styled } from "next-yak";

const items = [
  {
    q: "Is this production-ready?",
    a: "It’s an example demonstrating patterns, not a full product.",
  },
  {
    q: "How are styles organized?",
    a: "Global vars + shared modules + per-page CSS Modules.",
  },
  {
    q: "Can I extend this?",
    a: "Yes, add routes and reuse shared styles/components.",
  },
];

export default function FAQPage() {
  return (
    <Container>
      <h1>FAQ</h1>
      <QA>
        {items.map((x) => (
          <div key={x.q}>
            <Q>{x.q}</Q>
            <A>{x.a}</A>
          </div>
        ))}
      </QA>
    </Container>
  );
}

const Container = styled.div`
  padding: ${spacings[24]};
  display: grid;
  gap: ${spacings[16]};
`;

const QA = styled.div`
  display: grid;
  gap: ${spacings[8]};
`;

const Q = styled.div`
  font-weight: 600;
`;

const A = styled.div`
  color: rgba(0, 0, 0, 0.75);

  @media (prefers-color-scheme: dark) {
    color: rgba(255, 255, 255, 0.85);
  }
`;
