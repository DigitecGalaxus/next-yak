import { globalStyle, styled } from "@yak/react";

export const Dialog = styled.dialog`
  padding: 16px;
`;

globalStyle`
  body:has(${Dialog}[open]) {
    overflow: hidden;
  }
`;
