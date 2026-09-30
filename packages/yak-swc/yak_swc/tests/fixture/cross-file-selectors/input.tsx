import { styled } from "@yak/react";
// @ts-ignore
import { Icon } from "./Icon";

const primary = "green";
export const Button = styled.button`
  font-size: 1rem;
  color: ${primary};
  ${Icon} {
    color: red;
  }

  ${Icon} ${Icon} {
    color: blue;
  }
`;