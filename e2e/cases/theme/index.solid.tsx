import { styled, YakThemeProvider } from "@yak/solid";

// The theme reaches dynamic style functions and attrs functions through the
// provider, and the `theme` prop itself never lands on the element.
type Theme = { accent: string; mode: string };
const theme: Theme = { accent: "rgb(0, 128, 0)", mode: "dark" };

const Panel = styled.div.attrs((props) => ({
  "data-mode": (props.theme() as Theme).mode,
}))`
  color: ${({ theme }) => (theme() as Theme).accent};
`;

export default function App() {
  return (
    <YakThemeProvider theme={theme}>
      <Panel data-testid="panel">Themed</Panel>
    </YakThemeProvider>
  );
}
