import { css, styled, YakThemeProvider } from "next-yak";
import { useState } from "react";

type Theme = { brandName: "brandA" | "brandB" };

const Panel = styled.div.attrs(({ theme }) => ({
  title: (theme as Theme).brandName,
}))`
  ${({ theme }) =>
    (theme as Theme).brandName === "brandA"
      ? css`
          color: red;
        `
      : css`
          color: blue;
        `}
`;

export default function App() {
  const [theme, setTheme] = useState<Theme>({ brandName: "brandA" });
  return (
    <YakThemeProvider theme={theme}>
      <button
        data-testid="toggle-brand"
        onClick={() =>
          setTheme((current) => ({
            brandName: current.brandName === "brandA" ? "brandB" : "brandA",
          }))
        }
      >
        Switch brand
      </button>
      <Panel data-testid="panel">Themed</Panel>
    </YakThemeProvider>
  );
}
