import { styled, css, keyframes } from "next-yak";
// @ts-ignore
import type { DefaultTheme, StyledComponent } from "styled-components";

// styled component wrapped in `as unknown as ...` (e.g. when migrating from styled-components)
export const StyledSvg = styled.svg`
  fill: currentColor;
` as unknown as StyledComponent<
  "svg",
  DefaultTheme,
  {}
> & {
  __yak: true;
};

// css mixin wrapped in a type assertion
export const highlight = css`
  color: red;
` as unknown as ReturnType<typeof css>;

// keyframes wrapped in a type assertion
export const fade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
` as unknown as ReturnType<typeof keyframes>;

// styled component wrapping another styled component, both with casts
export const PrimaryButton = styled(StyledSvg)`
  ${highlight};
  animation: ${fade} 1s linear;
` as unknown as StyledComponent<"svg", DefaultTheme, {}>;

// using the cast styled component as a same-file selector
export const Container = styled.div`
  ${StyledSvg} {
    color: blue;
  }
`;
