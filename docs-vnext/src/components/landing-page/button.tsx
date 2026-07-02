import { radii, light, dark } from "@/tokens";
import { css } from "next-yak";

export const buttonStyles = css`
  --btn-offset: 3px;
  --btn-edge: light-dark(${light.violet}, ${dark.black});
  color: light-dark(${light.violet}, ${dark.white});
  border: 2.5px solid var(--btn-edge);
  border-radius: ${radii.card};
  box-shadow: var(--btn-offset) var(--btn-offset) 0 0 var(--btn-edge);
  cursor: pointer;
  background: light-dark(${light.beige1}, ${dark.navy1});

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform 0.08s ease,
      box-shadow 0.08s ease,
      border-color 0.08s ease;
  }

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: calc(var(--btn-offset) - 1px) calc(var(--btn-offset) - 1px) 0 0 var(--btn-edge);
  }

  &:active {
    transform: translate(var(--btn-offset), var(--btn-offset));
    box-shadow: 0 0 0 0 var(--btn-edge);
  }

  &:focus-visible {
    outline: none;
    border-color: light-dark(${light.red}, ${dark.red});
    box-shadow: var(--btn-offset) var(--btn-offset) 0 0 light-dark(${light.red}, ${dark.red});
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
