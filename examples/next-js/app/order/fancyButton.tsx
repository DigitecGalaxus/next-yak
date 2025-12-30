import { Button } from "./button";
import { styled } from "next-yak";

export const FancyButton = styled(Button)`
  color: #48d448;
  &:before {
    content: "FancyButton";
  }
`;
