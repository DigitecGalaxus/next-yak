import { css, styled, useTheme } from "@yak/solid";
import { toggleHighContrast } from "./theme.ts";

const Button = styled.button<{ $primary?: boolean }>`
  ${({ theme }) =>
    theme.highContrast
      ? css`
          color: #000;
        `
      : css`
          color: #009688;
        `}
  background: #fff;
  border: 1px solid currentColor;
  font-size: 17px;
  padding: 7px 12px;
  font-weight: normal;
  margin: 6px 0;
  margin-right: 12px;
  display: inline-block;
  font-family: "Open Sans", sans-serif;
  min-width: 120px;
  ${({ $primary }) =>
    $primary &&
    css`
      border-width: 2px;
    `}
`;

export const HighContrastToggle = () => {
  const theme = useTheme();
  return (
    <Button onClick={() => toggleHighContrast()}>
      {theme.highContrast ? "Disable" : "Enable"} High Contrast
    </Button>
  );
};
