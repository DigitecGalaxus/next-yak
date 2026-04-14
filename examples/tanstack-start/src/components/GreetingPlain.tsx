import { styled } from "next-yak";

export const GreetingPlain = () => {
  return (
    <Wrapper>
      <Headline>Hello from a Server Component</Headline>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: system-ui, sans-serif;
`;

const Headline = styled.h1`
  color: #e85d04;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 2rem;
`;
