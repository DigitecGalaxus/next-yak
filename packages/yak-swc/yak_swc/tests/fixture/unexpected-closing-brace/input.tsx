import { styled, css, globalStyle } from "@yak/react";

export const trailing = css`
  color: red }
`;

export const leading = css`} color: red;`;

export const between = css`color: red; } color: blue;`;

export const nextLine = css`
  color: red
};
`;

export const Button = styled.button`
  color: red; } color: blue;
`;

const inlined = css`color: green; } padding: 0;`;

export const Wrapper = styled.div`
  .foo { ${inlined} margin: 0; }
`;

export const SecondWrapper = styled.div`
  &:hover { ${inlined}; }
`;

export const Escaped = styled.div`
  content: "\\2022"; }
`;

globalStyle`
  body { margin: 0; } }
`;
