import { styled } from "@yak/react";

const before = "\\2022";

export const Button = styled.button`
  background-color: #007bff;
  &::before{
    content: "${before}";
  }
  &:after {
    content: "\\2022";
  }
`;
