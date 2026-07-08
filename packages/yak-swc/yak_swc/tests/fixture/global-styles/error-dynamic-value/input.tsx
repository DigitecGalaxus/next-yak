import { globalStyles } from "next-yak";

globalStyles`
  body {
    color: ${(props) => props.$color};
  }
`;
