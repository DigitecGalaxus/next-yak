import { styled } from "next-yak";

export const Greeting = () => {
  return (
    <Wrapper>
      <Headline>Hello from a Server Component</Headline>
      <Subtitle>
        This component is rendered on the server. It uses next-yak styled components with no
        client-side JavaScript.
      </Subtitle>
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

const Subtitle = styled.p`
  color: #555;
  line-height: 1.6;
`;
