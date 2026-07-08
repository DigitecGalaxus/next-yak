import { globalStyles, styled } from "next-yak";

export const Dialog = styled.dialog`
  padding: 16px;
`;

globalStyles`
  body:has(${Dialog}[open]) {
    overflow: hidden;
  }
`;
