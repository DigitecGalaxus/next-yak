import { globalCss, styled } from "next-yak";

export const Dialog = styled.dialog`
  padding: 16px;
`;

globalCss`
  body:has(${Dialog}[open]) {
    overflow: hidden;
  }
`;
