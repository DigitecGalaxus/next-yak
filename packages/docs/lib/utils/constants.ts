import { css } from "next-yak";

export const theme = {
  dark: ":global(html.dark) &",
  light: ":global(html.light) &",
};

export const colors = {
  secondary: css`
    transition: border-color 0.2s;
    border-width: 1px;
    border-style: solid;
    ${theme.light} {
      border-color: hsl(200 2.4% 0% / 0.3);
      &:hover {
        border-color: hsl(200 2.4% 0% / 0.6);
      }
    }
    ${theme.dark} {
      border-color: hsl(0 0% 100% / 0.3);
      &:hover {
        border-color: hsl(0 0% 100% / 0.6);
      }
    }
  `,
  secondaryStatic: css`
    border-width: 1px;
    border-style: solid;
    ${theme.light} {
      border-color: hsl(200 2.4% 0% / 0.3);
    }
    ${theme.dark} {
      border-color: hsl(0 0% 100% / 0.3);
    }
  `,
};

export const breakpoints = {
  sm: "@media (min-width: 640px)",
  md: "@media (min-width: 768px)",
  lg: "@media (min-width: 1024px)",
  xl: "@media (min-width: 1280px)",
  "2xl": "@media (min-width: 1536px)",
};
