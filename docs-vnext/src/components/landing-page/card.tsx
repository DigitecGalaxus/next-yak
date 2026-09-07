import { css, styled } from "next-yak";
import { radii, light, dark } from "@/tokens";

export const cardStyles = css`
  background: light-dark(${light.beige1}, ${dark.navy1});
  border: 1px solid light-dark(${light.violet}, ${dark.white});
  border-radius: ${radii.card};
`;

const Card = styled.div`
  ${cardStyles};
`;

export default Card;
