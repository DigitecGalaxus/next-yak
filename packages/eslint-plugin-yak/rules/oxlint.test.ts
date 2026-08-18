import { RuleTester } from "oxlint/plugins-dev";
import * as vitest from "vitest";
import yakPlugin from "../index.js";

RuleTester.it = vitest.it;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      lang: "ts",
    },
  },
});

ruleTester.run("yak/css-global-deprecated", yakPlugin.rules["css-global-deprecated"], {
  valid: [
    'import { styled } from "next-yak"; styled.div`color: red;`;',
    "const Component = styled.div`:global(body) { color: red; }`;",
  ],
  invalid: [
    {
      code: 'import { styled } from "next-yak"; styled.div`:global(body) { color: red; }`;',
      errors: [{ messageId: "globalSelectorDeprecated" }],
    },
  ],
});

ruleTester.run("yak/css-nesting-operator", yakPlugin.rules["css-nesting-operator"], {
  valid: [],
  invalid: [
    {
      code: ['import { styled } from "next-yak";', "styled.div`", "  > div { }", "`;"].join("\n"),
      errors: [
        {
          messageId: "missingNestingOperator",
          suggestions: [
            {
              messageId: "missingNestingOperator",
              output: [
                'import { styled } from "next-yak";',
                "styled.div`",
                "  & > div { }",
                "`;",
              ].join("\n"),
            },
          ],
        },
      ],
    },
  ],
});

ruleTester.run("yak/enforce-semicolon", yakPlugin.rules["enforce-semicolon"], {
  valid: [],
  invalid: [
    {
      code: ['import { styled } from "next-yak";', "styled.div`", "  ${mixin}", "`;"].join("\n"),
      output: ['import { styled } from "next-yak";', "styled.div`", "  ${mixin};", "`;"].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
  ],
});

ruleTester.run("yak/style-conditions", yakPlugin.rules["style-conditions"], {
  valid: [],
  invalid: [
    {
      code: "import { css } from 'next-yak'; css`color: ${({ variant }) => (variant ? 'red' : 'blue')}`;",
      errors: [{ messageId: "invalidRuntimeReturnValueWithExample" }],
    },
  ],
});
