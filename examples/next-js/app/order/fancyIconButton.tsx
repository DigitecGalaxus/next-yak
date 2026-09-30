import { styled } from "@yak/react";
import { IconButton } from "./iconButton";

export const FancyIconButton = styled(IconButton)`
  color: hotpink;
  &:before {
    content: "FancyIconButton";
  }
  ${IconButton} {
    color: #f0f;
  }
`;
