import { css, styled } from "@yak/react";

const outlined = css`
  outline: 3px solid red;
`;

const Title = styled.h1`
  color: green;
`;

const highlighted = css`
  color: blue;
`;

export { outlined, Title, outlined as alias, Title as Heading, highlighted as default };
