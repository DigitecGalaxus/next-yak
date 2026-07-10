import { globalStyle } from "next-yak";

globalStyle`
  body {
    color: ${(props) => props.$color};
  }
`;
