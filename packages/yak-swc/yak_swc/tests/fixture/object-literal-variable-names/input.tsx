import { styled } from "next-yak";

const buttons = {
  primary: styled.button<{ $c: string }>`
    color: ${({ $c }) => $c};
  `,
  danger: styled.button<{ $c: string }>`
    color: ${({ $c }) => $c};
  `,
};
