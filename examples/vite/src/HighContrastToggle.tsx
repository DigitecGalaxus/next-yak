"use client";
import { css, styled, useTheme } from "next-yak";

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
    <Button
      onClick={() => {
        setCookie("highContrast", theme.highContrast ? "false" : "true");
        window.location.reload();
      }}
    >
      Toggle High Contrast
    </Button>
  );
};

function setCookie(name: string, value: string, days: number = 365) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
