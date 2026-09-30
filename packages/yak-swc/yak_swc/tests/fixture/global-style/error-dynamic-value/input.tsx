import { globalStyle } from "@yak/react";

globalStyle`
  body {
    color: ${(props) => props.$color};
  }
`;
