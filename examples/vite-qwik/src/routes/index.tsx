import { component$, useSignal } from "@qwik.dev/core";
import { css, keyframes, styled } from "@yak/qwik";
import { Clock } from "../Clock.tsx";
import { HighContrastToggle } from "../HighContrastToggle.tsx";

const Headline = styled.h1<{ $primary?: boolean }>`
  filter: drop-shadow(0px 0px 1px #fff);
  ${(props) =>
    props.theme.highContrast
      ? css`
          color: #000;
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

  &:hover {
    color: red;
  }
  ${(props) =>
    props.$primary &&
    css`
      font-size: 2.4rem;
    `}
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: inline-block;
  ${(props) =>
    props.theme.highContrast
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
  margin: 6px 12px 6px 0;
  min-width: 120px;
  ${(props) =>
    props.$primary &&
    css`
      border-width: 2px;
    `}
`;

const FancyButton = styled(Button)`
  color: #fff;
  background: linear-gradient(
    149deg,
    #5552eb 0%,
    rgba(253, 29, 29, 1) 50%,
    rgba(252, 176, 69, 1) 100%
  );
`;

const SubmitButton = styled(Button).attrs({ type: "submit" })`
  font-weight: bold;
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.span`
  width: 24px;
  height: 24px;
  display: inline-block;
  border-radius: 50%;
  border: 3px solid #ddd;
  border-top-color: #ae52eb;
  animation: ${rotate} 1.2s linear infinite;
`;

const Progress = styled.div<{ $percent: number }>`
  height: 8px;
  margin: 12px 0;
  border-radius: 4px;
  background: #e5e5ef;
  overflow: hidden;

  &::before {
    content: "";
    display: block;
    height: 100%;
    background: #009688;
    width: ${(props) => props.$percent}%;
    transition: width 0.2s ease-out;
  }
`;

export default component$(() => {
  const percent = useSignal(30);
  return (
    <main>
      <Headline $primary>Yak + Qwik 2</Headline>
      <Clock />
      <HighContrastToggle />
      <Button>Ghost</Button>
      <Button $primary>Primary Ghost</Button>
      <FancyButton $primary title="fancy">
        Fancy Ghost
      </FancyButton>
      <SubmitButton>Submit (attrs)</SubmitButton>
      <p>
        <Spinner /> keyframes work if this spins
      </p>
      <Progress $percent={percent.value} />
      <Button onClick$={() => (percent.value = (percent.value + 10) % 110)}>
        Grow progress bar ({percent.value}%)
      </Button>
      <p
        css={css`
          color: green;
        `}
      >
        CSS Prop works if this is green
      </p>
      <p
        class="static-class"
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
    </main>
  );
});
