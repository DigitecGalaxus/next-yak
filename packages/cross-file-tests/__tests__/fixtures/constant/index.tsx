import { styled, css } from "next-yak";
import { colors, siteMaxWidth } from "./constants";
export const Button = styled.button<{$variant: 'primary' | 'secondary'}>`
  color: red;
  height: ${siteMaxWidth}px;
  color: ${colors.primary};
  background-color: ${colors.secondary};
  ${({$variant}) => $variant === "secondary" && css`
    color: ${colors.secondary};
    background-color: ${colors.primary};
  `}

`;