import { css, styled } from "next-yak";

const outlined = css`
  outline: 3px solid red;
`;

const Title = styled.h1`
  color: green;
`;

export { outlined, Title as Heading };
