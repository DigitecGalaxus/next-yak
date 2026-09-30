/** @jsxImportSource @yak/react */
import { styled } from "@yak/react";
import { createFileRoute } from "@tanstack/react-router";
import { Counter } from "../components/Counter";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <Main>
      <Title>@yak/react + TanStack Start</Title>
      <Description>
        A simple page styled with @yak/react. This is a client-rendered route with yak styled
        components.
      </Description>
      <Counter />
    </Main>
  );
}

const Main = styled.main`
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: system-ui, sans-serif;
`;

const Title = styled.h1`
  color: #e85d04;
  font-size: 2rem;
`;

const Description = styled.p`
  color: #555;
  line-height: 1.6;
`;
