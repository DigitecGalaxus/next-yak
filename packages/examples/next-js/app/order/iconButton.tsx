import { styled } from "next-yak";
import { Button } from "./button";

export const IconButton = styled(Button)`
  color: #ec79ec;
  &:before {
    content: "IconButton";
  }
`;
