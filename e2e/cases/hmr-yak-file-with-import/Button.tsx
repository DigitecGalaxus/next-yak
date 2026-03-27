import { styled } from "next-yak";
import { spacing } from "./spacings.yak.ts";
import { primaryColor } from "./colors.yak.ts";

const StyledButton = styled.button`
  padding: ${spacing}px;
  color: ${primaryColor};
`;

export function Button() {
  return <StyledButton data-testid="button">Button</StyledButton>;
}
