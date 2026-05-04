import { styled } from "next-yak";

// Dynamic interpolation inside @media query is not valid CSS:
// the browser cannot read CSS variables before the media query is evaluated.
const Box = styled.div`
  background: red;

  @media ${(p) => p.theme.queries.desktopAndAbove} {
    display: none;
  }
`;
