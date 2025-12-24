import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";
import { cssGlobalDeprecated } from "./cssGlobalDeprecated.js";

RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

ruleTester.run("css-global-deprecated", cssGlobalDeprecated, {
  valid: [
    // No :global() usage
    `
      import { styled } from "next-yak";
      const Button = styled.button\`
        color: red;
      \`;
    `,
    // CSS mode (no :global() generated)
    `
      import { styled } from "next-yak";
      const Button = styled.button\`
        .external-class {
          color: red;
        }
      \`;
    `,
  ],

  invalid: [
    // User-written :global() with HTML element
    {
      code: `
        import { styled } from "next-yak";
        const Button = styled.button\`
          :global(html) {
            background: white;
          }
        \`;
      `,
      errors: [
        {
          messageId: "globalSelectorDeprecated",
        },
      ],
    },
    // User-written :global() with external class
    {
      code: `
        import { styled } from "next-yak";
        const Button = styled.button\`
          :global(.external-class) {
            color: red;
          }
        \`;
      `,
      errors: [
        {
          messageId: "globalSelectorDeprecated",
        },
      ],
    },
    // User-written :global() with external ID
    {
      code: `
        import { styled } from "next-yak";
        const Button = styled.button\`
          :global(#external-id) {
            color: red;
          }
        \`;
      `,
      errors: [
        {
          messageId: "globalSelectorDeprecated",
        },
      ],
    },
    // User-written :global() with attribute selector
    {
      code: `
        import { styled } from "next-yak";
        const Button = styled.button\`
          :global([data-attr]) {
            color: red;
          }
        \`;
      `,
      errors: [
        {
          messageId: "globalSelectorDeprecated",
        },
      ],
    },
    // Multiple user-written :global() selectors
    {
      code: `
        import { styled } from "next-yak";
        const Button = styled.button\`
          :global(html) {
            background: white;
          }
          :global(.external-class) {
            color: red;
          }
        \`;
      `,
      errors: [
        {
          messageId: "globalSelectorDeprecated",
        },
        {
          messageId: "globalSelectorDeprecated",
        },
      ],
    },
  ],
});
