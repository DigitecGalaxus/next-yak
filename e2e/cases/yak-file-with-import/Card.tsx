import { styled } from "next-yak";
import { primaryColor } from "./colors.yak.ts";

const StyledCard = styled.div`
  color: ${primaryColor};
`;

export function Card() {
  return <StyledCard data-testid="card">Card</StyledCard>;
}
