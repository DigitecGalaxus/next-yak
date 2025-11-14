import { styled } from "next-yak";
import { typography } from "./typography.yak";

export const Headline = styled.button`
  color: red;
  ${typography.h1};
`;

export const Button = styled.button`
  color: red;
  ${typography.h3};
`;