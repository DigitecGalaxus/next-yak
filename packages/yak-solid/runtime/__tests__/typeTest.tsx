/**
 * Type-only tests for the public @yak/solid API (pre-compilation typings).
 * Checked by `pnpm test:types` - never executed.
 */
import { css, styled, keyframes, useTheme, YakThemeProvider } from "@yak/solid";

// styled with intrinsic elements infers tag props
const Button = styled.button<{ $primary?: boolean }>`
  color: ${({ $primary }) => ($primary ? "red" : "blue")};
`;

const buttonUsage = (
  <Button type="submit" $primary onClick={(event) => event.currentTarget.disabled} />
);

// @ts-expect-error - unknown props are rejected
const invalidPropUsage = <Button unknownProp />;

// styled(Component) requires class/style compatible props
const Custom = (props: { class?: string; label: string }) => <div class={props.class} />;
const StyledCustom = styled(Custom)`
  color: red;
`;
const customUsage = <StyledCustom label="hello" />;

// @ts-expect-error - missing required prop
const missingPropUsage = <StyledCustom />;

// attrs narrow the outer props
const WithAttrs = styled.input.attrs({ type: "text" })`
  color: red;
`;
const withAttrsUsage = <WithAttrs value="x" />;

// keyframes returns an animation-name usable in interpolations
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const Spinner = styled.div`
  animation: ${rotate} 1s linear infinite;
`;

// css prop is available on intrinsic elements (via css-prop.d.ts)
const cssPropUsage = (
  <div
    css={css`
      color: red;
    `}
  />
);

// theme APIs
const theme = useTheme();
const provider = <YakThemeProvider theme={{}}>{cssPropUsage}</YakThemeProvider>;

export { buttonUsage, customUsage, withAttrsUsage, Spinner, provider };
