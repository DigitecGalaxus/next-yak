import { css, keyframes, styled } from "next-yak";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Card = styled.div`
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  border-radius: 12px;
  color: white;
  background: linear-gradient(135deg, #6d28d9, #2563eb);
  animation: ${fadeIn} 0.4s ease both;
`;

const Title = styled.h1<{ $accent?: boolean }>`
  margin: 0;
  font-size: 24px;
  ${({ $accent }) =>
    $accent &&
    css`
      color: #fde047;
    `}
`;

export function App() {
  return (
    <Card data-testid="card">
      <Title data-testid="title" $accent>
        next-yak on Rspack
      </Title>
      <span>Zero-runtime CSS-in-JS, build-time extracted.</span>
    </Card>
  );
}
