import { globalStyle, styled } from "@yak/react";

// yak writes plain CSS: a user-written :global() is a build error everywhere
export const Button = styled.button`
  :global(.dark) & {
    color: white;
  }
`;

globalStyle`
  :global(.maps) {
    border: 1px solid black;
  }
`;
