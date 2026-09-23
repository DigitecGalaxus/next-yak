import { css } from "next-yak";
import { light, dark } from "@/tokens";
import { inlineCode } from "@/lib/mixins";

/**
 * The prose rules of a long-form page. The docs page and a blog post both apply them, so
 * a heading, a list and a link read the same wherever the reader lands.
 */
export const proseStyles = css`
  h2,
  h3,
  h4 {
    color: light-dark(${light.violet}, ${dark.white});
    line-height: 1.25;
  }
  /* Hierarchy comes from size + weight + generous top margin rather than a rule,
     so stacked sections don't read like ledger lines. */
  h2 {
    font-size: 26px;
    margin-top: 52px;
  }
  h3 {
    font-size: 20px;
    margin-top: 32px;
  }
  p {
    margin: 12px 0;
  }
  p a,
  li a,
  td a,
  blockquote a {
    color: light-dark(${light.red}, ${dark.red});
    text-decoration: underline;
    text-underline-offset: 3px;

    /* a prose link rests red, so the hover deepens it and thickens the rule */
    &:hover,
    &:focus-visible {
      color: light-dark(${light.redDeep}, ${dark.redDeep});
      text-decoration-thickness: 2px;
    }
  }
  /* Heading anchor links stay clean even inside <li> (e.g. Steps), where the
     li-a rule above would otherwise recolor + underline them. */
  h2 a,
  h3 a,
  h4 a {
    color: inherit;
    text-decoration: none;
  }
  ul,
  ol {
    margin: 12px 0;
    padding-left: 22px;
  }
  li {
    margin: 4px 0;
  }
  /* Inline code only; fenced blocks are rendered by <CodeBlock>. */
  & :not(pre) > code {
    ${inlineCode};
  }
  table {
    width: 100%;
    margin: 16px 0;
    border-collapse: collapse;
    font-size: 14px;
  }
  th,
  td {
    padding: 6px 10px;
    text-align: left;
  }
  blockquote {
    margin: 16px 0;
    padding-left: 14px;
    border-left: 3px solid light-dark(${light.violet}, ${dark.white});
  }
`;
