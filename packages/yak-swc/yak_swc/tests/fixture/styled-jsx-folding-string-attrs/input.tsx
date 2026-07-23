import { css, styled } from "next-yak";

// JSX attribute strings are decoded before they reach the condition:
// entities like &amp; and literal backslashes must compare by value,
// not by their JSX source spelling
const Category = styled.li<{ $label?: string }>`
  color: grey;
  ${({ $label }) =>
    $label === "Food & Drink" &&
    css`
      color: crimson;
    `}
`;

const Shortcut = styled.kbd<{ $keys?: string }>`
  color: grey;
  ${({ $keys }) =>
    $keys === "a\\tb" &&
    css`
      color: dodgerblue;
    `}
`;

// A static merge goes through expression position so a backslash escape in the
// user className survives the JSX re-parse instead of doubling
const Cross = styled.span`
  color: grey;
`;

export const Menu = () => (
  <>
    <Category $label="Food &amp; Drink">Food &amp; Drink</Category>
    <Shortcut $keys="a\tb">a\tb</Shortcut>
    <Cross className="before:content-['\00d7'] icon &amp; more">x</Cross>
  </>
);
