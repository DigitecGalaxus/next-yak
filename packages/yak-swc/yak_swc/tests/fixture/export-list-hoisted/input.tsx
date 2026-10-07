import { css, styled } from "next-yak";

export { outlined, Title as Heading };

const outlined = css`
  outline: 3px solid red;
`;

const Title = styled.h1`
  color: green;
`;
