import { styled, css } from "next-yak";

// Covers both comment emission sites: a named export and a default export
export const Button = styled.button`
  color: red;
`;

export const mixin = css`
  font-weight: bold;
`;

const Title = styled.h1`
  font-size: 24px;
`;

export default Title;
