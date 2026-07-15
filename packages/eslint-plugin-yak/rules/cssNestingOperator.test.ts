import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";
import { cssNestingOperator } from "./cssNestingOperator.js";

RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

const getErrorWithSuggestionsCode = (options: { code: string }) =>
  [
    {
      messageId: "missingNestingOperator",
      suggestions: [
        {
          messageId: "missingNestingOperator",
          output: options.code,
        },
      ],
    },
  ] as const;

ruleTester.run("yak-css-nesting-operator", cssNestingOperator, {
  valid: [
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
   color: red;
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
   \${mixin};
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    & + * { }
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    :hover & { }
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    & ~ * { }
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    :root { }
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    :modal { }
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    global(selector) { }
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
  div {
    > :focus { }
  }
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
  \${({ $condition }) =>
    $condition &&
    css\`
      & > div {
        > :focus {
        }
      }
    \`
  }
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    input:not(:active, :selected):focus-visible { }
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    div > :hover { }
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    div > * { }
  \``,
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    \${Selector} > :hover { }
  \``,
    },
  ],
  invalid: [
    {
      code: `import { styled, css } from "next-yak";
  const x = styled.div\`
    /* { */
    > div {
    }
    /* } */
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled, css } from "next-yak";
  const x = styled.div\`
    /* { */
    & > div {
    }
    /* } */
  \``,
      }),
    },
    {
      code: `import { styled, css } from "next-yak";
  const x = styled.div\`
  \${({ $condition }) =>
      $condition &&
      css\`
        ::before {
          > :focus {
          }
        }
      \`
  }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled, css } from "next-yak";
  const x = styled.div\`
  \${({ $condition }) =>
      $condition &&
      css\`
        &::before {
          > :focus {
          }
        }
      \`
  }
  \``,
      }),
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
   > button {
     > span { }
   }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled } from "next-yak";
  const x = styled.div\`
   & > button {
     > span { }
   }
  \``,
      }),
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
   ::after { }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled } from "next-yak";
  const x = styled.div\`
   &::after { }
  \``,
      }),
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
   :not(:active, :selected):focus-visible { }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled } from "next-yak";
  const x = styled.div\`
   &:not(:active, :selected):focus-visible { }
  \``,
      }),
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
   :hover :active { }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled } from "next-yak";
  const x = styled.div\`
   &:hover :active { }
  \``,
      }),
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
   &:hover,
   :active { }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled } from "next-yak";
  const x = styled.div\`
   &:hover,
   &:active { }
  \``,
      }),
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    > :is { }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled } from "next-yak";
  const x = styled.div\`
    & > :is { }
  \``,
      }),
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    > * { }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled } from "next-yak";
  const x = styled.div\`
    & > * { }
  \``,
      }),
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    :dir(rtl) { }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled } from "next-yak";
  const x = styled.div\`
    &:dir(rtl) { }
  \``,
      }),
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    :hover { }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled } from "next-yak";
  const x = styled.div\`
    &:hover { }
  \``,
      }),
    },
    // Bare pseudo-selectors can intentionally mean descendants in native CSS nesting.
    // Keep the potentially behavior-changing `&` insertion as an opt-in suggestion.
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    :first-child { }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled } from "next-yak";
  const x = styled.div\`
    &:first-child { }
  \``,
      }),
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    :has(img) { }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled } from "next-yak";
  const x = styled.div\`
    &:has(img) { }
  \``,
      }),
    },
    {
      code: `import { styled } from "next-yak";
  const x = styled.div\`
    ::backdrop { }
  \``,
      output: null,
      errors: getErrorWithSuggestionsCode({
        code: `import { styled } from "next-yak";
  const x = styled.div\`
    &::backdrop { }
  \``,
      }),
    },
  ],
});
