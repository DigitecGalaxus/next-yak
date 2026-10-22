import { css, styled } from "@yak/qwik";

const outlined = css`
  outline: 3px solid red;
`;

const Title = styled.h1`
  color: green;
`;

export { outlined, Title as Heading };
