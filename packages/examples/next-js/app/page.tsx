/** @jsxImportSource next-yak */
import { YakThemeProvider, atoms, css, styled } from "next-yak";
import styles from "./page.module.css";
import { queries, colors } from "@/theme/constants.yak";
import { Clock } from "./Clock";
import { Inputs } from "@/app/Input";
import { HighContrastToggle } from "./HighContrastToggle";
import { typography } from "./mixins";
import { mixins, tokens } from "./constants";
import defaultColor from "./constantColors";

const headline = css<{ $primary?: boolean }>`
  ${typography.h1};
  filter: drop-shadow(0px 0px 1px #fff);
  ${({ theme }) =>
    theme.highContrast
      ? css`
          color: ${colors.dark};
        `
      : css`
          color: blue;
          background: linear-gradient(
            149deg,
            #ae52eb 0%,
            rgba(253, 29, 29, 1) 50%,
            rgba(252, 176, 69, 1) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        `}

  ${queries.sm} {
    font-size: 1.5rem;
    ${({ $primary }) =>
      $primary &&
      css`
        font-size: 1.7rem;
      `}
  }

  &:before,
  &:after {
    content: "\\2022";
  }

  &:hover {
    color: red;
  }
  ${({ $primary }) =>
    $primary &&
    css`
      color: green;
    `}
`;

const Headline = styled.h1<{ $primary?: boolean }>`
  ${headline};
`;

const SubHeadline = styled.h2`
  ${typography.h2};
  color: #323248;
`;

const Button = styled.button<{ $primary?: boolean }>`
  @layer base {
    display: block;
    ${({ theme }) =>
      theme.highContrast
        ? css`
            color: ${colors.dark};
          `
        : css`
            color: #009688;
          `}
    background: #fff;
  }
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

const FancyButton = styled(Button)`
  color: #fff;
  background: linear-gradient(
    149deg,
    #ae52eb 0%,
    rgba(253, 29, 29, 1) 50%,
    rgba(252, 176, 69, 1) 100%
  );
`;

const StyledLink = styled.a`
  background: linear-gradient(
    149deg,
    #ae52eb 0%,
    rgba(253, 29, 29, 1) 50%,
    rgba(252, 176, 69, 1) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100%;
  filter: drop-shadow(0px 0px 1px #fff);
  font-weight: bold;
  border-bottom: 2px solid red;
  transition: all 0.3s ease-in-out;
  &:hover {
    background-position: 100% 0;
    border-bottom-color: #9d0a0a;
  }
`;

const NestedConstantText = styled.span`
  color: ${tokens.colors.orange};
`;

const ToBeWrapped = styled.div<{ $primary: boolean }>`
  ${atoms(
    styles.green,
    false && styles.large,
    (_, classNames) => {
      classNames.delete(styles.blue);
      classNames.add(styles.yellow);
    },
    () => {},
  )}
`;

const Wrap = styled(ToBeWrapped)<{ $secondary: boolean }>`
  ${atoms((_, classNames) => {
    classNames.delete(styles.yellow);
    classNames.add(styles.italic);
  })}
`;

export default function Home() {
  return (
    <YakThemeProvider>
      <main className={styles.main}>
        <Headline $primary>Hello world</Headline>
        <SubHeadline>example page</SubHeadline>
        <Button>Ghost</Button>
        <Button $primary>Primary Ghost</Button>
        <FancyButton $primary title="fancy">
          Fancy Ghost
        </FancyButton>
        <Clock />
        <HighContrastToggle />
        <StyledLink href="https://github.com/jantimon/next-yak/tree/main/packages/example/app">
          view code
        </StyledLink>
        <p
          css={css`
            color: green;
          `}
        >
          CSS Prop works if this is green
        </p>
        <p
          css={css`
            color: red;
            ${() =>
              true &&
              css`
                color: green;
              `}
          `}
        >
          Conditional CSS Prop works if this is green
        </p>
        <p
          css={css`
            color: violet;
          `}
        >
          Nested CSS Prop works
          <span
            css={css`
              color: green;
            `}
          >
            {" "}
            if this is green{" "}
          </span>
          and this is violet
        </p>
        <p
          css={css`
            ${mixins.primary.main};
          `}
        >
          Nested constants work if this is light blue{" "}
          <NestedConstantText>this is orange </NestedConstantText>
          <span
            css={css`
              color: ${defaultColor};
            `}
          >
            and this is teal
          </span>
        </p>
        <p
          css={atoms(styles.small, (_, __, style) => {
            style["color"] = "black";
          })}
        >
          Atoms in css props work if this is small{" "}
          <span
            css={css`
              color: black;
              ${atoms(styles.small, true && styles.red, (_, classNames) => {
                classNames.delete(styles.red);
                classNames.delete(styles.small);
                classNames.add(styles.large);
              })}
            `}
          >
            and this is large
          </span>
        </p>
        <Wrap
          className={`${styles.small} ${styles.blue}`}
          $primary={true}
          $secondary={true}
        >
          Atoms in styled components work if this is small, green and italic
        </Wrap>
        <Inputs />
      </main>
    </YakThemeProvider>
  );
}
