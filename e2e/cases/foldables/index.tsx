/** @jsxImportSource next-yak */
import { useState } from "react";
import { css, styled } from "next-yak";

// folds to a plain div
const Card = styled.div`
  color: rgb(0, 128, 0);
`;

// folds to <Card className="...">
const Extended = styled(Card)`
  background-color: rgb(255, 255, 0);
`;

// class-toggling $prop - foldable usages inline the condition
const Toggle = styled.span<{ $active?: boolean }>`
  color: rgb(0, 0, 255);
  ${({ $active }) =>
    $active &&
    css`
      color: rgb(255, 0, 0);
    `}
`;

// ternary mixin
const Tone = styled.p<{ $variant?: string }>`
  ${({ $variant }) =>
    $variant === "primary"
      ? css`
          color: rgb(128, 0, 128);
        `
      : css`
          color: rgb(255, 165, 0);
        `}
`;

// string comparison against an attribute that JSX spells with an HTML entity -
// the fold must compare the decoded value, not the source text
const Category = styled.li<{ $label?: string }>`
  color: rgb(105, 105, 105);
  ${({ $label }) =>
    $label === "Food & Drink" &&
    css`
      color: rgb(220, 20, 60);
    `}
`;

// backslashes in JSX attribute strings are literal characters, not JS escapes
const Shortcut = styled.kbd<{ $keys?: string }>`
  color: rgb(105, 105, 105);
  ${({ $keys }) =>
    $keys === "a\\tb" &&
    css`
      color: rgb(30, 144, 255);
    `}
`;

// non-$ prop: stays on the element and toggles classes
const ActionButton = styled.button<{ disabled?: boolean }>`
  color: rgb(0, 0, 0);
  ${({ disabled }) =>
    !disabled &&
    css`
      color: rgb(0, 128, 128);
    `}
`;

export default function App() {
  const [active, setActive] = useState(false);
  const spreadProps = { $active: true };
  return (
    <>
      <Card data-testid="static">static fold</Card>
      <Extended data-testid="extended">static styled(Component) fold</Extended>
      <Toggle data-testid="toggle-on" $active>
        on
      </Toggle>
      <Toggle data-testid="toggle-off">off</Toggle>
      <Toggle data-testid="toggle-state" $active={active}>
        state driven
      </Toggle>
      <button data-testid="activate" onClick={() => setActive(true)}>
        activate
      </button>
      {/* spread props keep the runtime path - must render like the folded twin */}
      <Toggle data-testid="toggle-runtime" {...spreadProps}>
        runtime path
      </Toggle>
      <Toggle
        data-testid="merged"
        $active
        css={css`
          text-decoration-line: underline;
        `}
      >
        css prop merge
      </Toggle>
      <Tone data-testid="tone-primary" $variant="primary">
        primary
      </Tone>
      <Tone data-testid="tone-default">default</Tone>
      <ActionButton data-testid="enabled">enabled</ActionButton>
      <ActionButton data-testid="disabled" disabled>
        disabled
      </ActionButton>
      {/* entity spelling decodes to "Food & Drink" - must match like the runtime twin below */}
      <Category data-testid="entity" $label="Food &amp; Drink">
        Food &amp; Drink
      </Category>
      <Category data-testid="entity-runtime" {...{ $label: "Food & Drink" }}>
        runtime twin
      </Category>
      {/* the attribute value is the four characters a \ t b - not a tab */}
      <Shortcut data-testid="backslash" $keys="a\tb">
        a\tb
      </Shortcut>
    </>
  );
}
