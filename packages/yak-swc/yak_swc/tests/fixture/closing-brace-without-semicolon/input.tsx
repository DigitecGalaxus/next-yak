import { styled, css } from "@yak/react";

export const Button = styled.button`
  &:hover { color: blue }
  @media (min-width: 640px) { color: red }
  padding: 0
`;

export const mixin = css`
  &:focus { outline: none }
`;

export const Element = () => <div css={css`&:hover { color: blue }`} />;
