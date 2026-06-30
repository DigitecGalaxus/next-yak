import { colors, radii } from "@/tokens";
import { css } from "next-yak";

export const buttonStyles = css`
  color: ${colors.violet};
  border: 2.5px solid ${colors.violet};
  border-radius: ${radii.card};
  box-shadow: 3px 3px 0 0 ${colors.violet};
  cursor: pointer;
  background: ${colors.beigeLight};

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform 0.08s ease,
      box-shadow 0.08s ease,
      border-color 0.08s ease;
  }

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0 0 ${colors.violet};
  }

  &:active {
    transform: translate(3px, 3px);
    box-shadow: 0 0 0 0 ${colors.violet};
  }

  &:focus-visible {
    outline: none;
    border-color: ${colors.red};
    box-shadow: 3px 3px 0 0 ${colors.red};
  }
`;

export const centeredButton = css`
  ${buttonStyles};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const iconButton = css`
  ${centeredButton};
  width: 40px;
  height: 40px;
`;
