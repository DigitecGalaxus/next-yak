import { globalStyle, styled } from "next-yak";

export const Dialog = styled.dialog`
  padding: 16px;
`;

globalStyle`
  body:has(${Dialog}[open]) {
    overflow: hidden;
  }
`;
