import { component$ } from "@qwik.dev/core";
import { styled } from "@yak/qwik";

const Title = styled.h1`
  color: red;
  font-size: 24px;
`;

export default component$(() => <Title data-testid="title">Hello Yak</Title>);
