import { component$, useContextProvider, useStore } from "@qwik.dev/core";
import { css, styled, YakThemeContext } from "@yak/qwik";

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

// the app provides the theme from component$ code: the package ships no
// provider component
export default component$(() => {
  const theme = useStore<Theme>({ brandName: "brandA" });
  useContextProvider(YakThemeContext, theme);
  return (
    <>
      <button
        data-testid="toggle-brand"
        onClick$={() => (theme.brandName = theme.brandName === "brandA" ? "brandB" : "brandA")}
      >
        Switch brand
      </button>
      <Panel data-testid="panel">Themed</Panel>
    </>
  );
});
