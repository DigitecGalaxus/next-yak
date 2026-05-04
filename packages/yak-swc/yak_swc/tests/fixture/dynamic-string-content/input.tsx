import { styled } from "next-yak";

// Dynamic value wrapped in quotes should produce `var(--xxx)` (unquoted),
// because `var()` references inside string literals are treated as literal
// text by the CSS engine and never get substituted.
const Input = styled.input<{ $placeholder: string; $marker: string }>`
  &::before {
    content: "${(p) => p.$placeholder}";
  }
  &::after {
    content: '${(p) => p.$marker}';
  }
`;

// var() inside url() works because url() evaluates the var, so
// `url("${...}")` is also stripped to `url(var(--xxx))`.
const Bg = styled.div<{ $url: string }>`
  background: url("${(p) => p.$url}");
`;

// Partial interpolation is intentionally NOT rewritten — the surrounding
// static text means the user must restructure their CSS (e.g. split into
// multiple values) for var() to actually substitute.
const Partial = styled.span<{ $name: string }>`
  &::before {
    content: "Hello ${(p) => p.$name}";
  }
`;
