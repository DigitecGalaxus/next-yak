import { css, styled } from "next-yak";
import { colors, radii } from "@/tokens";

export const cardStyles = css`
  background: ${colors.beigeLight};
  border: 1px solid ${colors.violet};
  border-radius: ${radii.card};
`;

const Card = styled.div`
  ${cardStyles};
`;

export default Card;
