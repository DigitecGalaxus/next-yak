import { styled, css } from "@yak/react";

export const ThemedButton = styled.button`
  &:hover {
    ${css`
      color: black;
      ${({ $active }) =>
        $active &&
        css`
          color: red;
        `}
    `}
  }
`;
