import { styled } from "@yak/react";

const primary = "red";
const selector = ".icon";
const query = "@media (min-width: 640px)";
const background = "url(data:image/png;base64,AAAA)";

export const Valid = styled.div`
  color: ${primary};
  background: ${background};
  ${selector} {
    color: blue;
  }
  ${query} {
    color: green;
  }
`;

const hover = "&:hover { color: red; }";
const reset = "margin: 0; padding: 0;";
const value = "red; } color: blue";

export const Invalid = styled.div`
  ${hover};
  ${reset};
  .foo {
    color: ${value};
  }
`;
