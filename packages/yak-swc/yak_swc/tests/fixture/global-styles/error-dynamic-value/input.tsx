import { globalCss } from "next-yak";

globalCss`
  body {
    color: ${(props) => props.$color};
  }
`;
