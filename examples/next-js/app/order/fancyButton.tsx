import { Button } from "./button";
import { styled } from "@yak/react";

export const FancyButton = styled(Button)`
  color: #48d448;
  &:before {
    content: "FancyButton";
  }
`;
