import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";
import { enforceSemicolons } from "./enforceSemicolon.js";

RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

ruleTester.run("yak-enforce-semicolons", enforceSemicolons, {
  valid: [
    {
      // Single selector expression
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  ${foo} {",
        "}`",
      ].join("\n"),
    },
    {
      // Two selector expressions
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  ${bar} ${foo} {",
        "}`",
      ].join("\n"),
    },
    {
      // Selector expression followed by a selector
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  ${foo} div",
        "{",
        "}`",
      ].join("\n"),
    },
    {
      // Single mixin without other css
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  ${foo};",
        "`",
      ].join("\n"),
    },
    {
      // Mixin with other css before
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  color: red;",
        "  ${foo};",
        "`",
      ].join("\n"),
    },
    {
      // Arrow function expression
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  ${({ $myVar }) => css`",
        "  color: red;",
        "  `}",
        "`",
      ].join("\n"),
    },
    {
      // Constant expression as css value
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  transition: transform ${time}",
        "    ,opacity 0.3s;",
        "`",
      ].join("\n"),
    },
    {
      // Conditional expression
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "${",
        "$visuallyUnmounted &&",
        "css`",
        "  ${screenRangeQueries.desktopWidescreen} {",
        "    transform: translateY(0);",
        "  }",
        "`",
        "}",
        "`",
      ].join("\n"),
    },
  ],
  invalid: [
    {
      // Mixin with attrs and styled.div
      code: [
        'import { styled } from "next-yak";',
        "export const Skeleton = styled.div.attrs<ISkeletonProps>({",
        ' "aria-hidden": true,',
        " disableAnimation: undefined,",
        " })<ISkeletonProps>`",
        " ${skeletonStyle}",
        "`",
      ].join("\n"),
      output: [
        'import { styled } from "next-yak";',
        "export const Skeleton = styled.div.attrs<ISkeletonProps>({",
        ' "aria-hidden": true,',
        " disableAnimation: undefined,",
        " })<ISkeletonProps>`",
        " ${skeletonStyle};",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin with attrs and styled(button)
      code: [
        'import { styled } from "next-yak";',
        "export const Skeleton = styled(button).attrs<ISkeletonProps>({",
        ' "aria-hidden": true,',
        " disableAnimation: undefined,",
        " })<ISkeletonProps>`",
        " ${skeletonStyle}",
        "`",
      ].join("\n"),
      output: [
        'import { styled } from "next-yak";',
        "export const Skeleton = styled(button).attrs<ISkeletonProps>({",
        ' "aria-hidden": true,',
        " disableAnimation: undefined,",
        " })<ISkeletonProps>`",
        " ${skeletonStyle};",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin with no other css
      code: [
        'import { styled } from "next-yak";',
        "styled.button`",
        "${foo}",
        "`",
      ].join("\n"),
      output: [
        'import { styled } from "next-yak";',
        "styled.button`",
        "${foo};",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin with whitespace around but no other css
      code: [
        'import { styled } from "next-yak";',
        "styled.button`",
        "  ${foo}  ",
        "`",
      ].join("\n"),
      output: [
        'import { styled } from "next-yak";',
        "styled.button`",
        "  ${foo};  ",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin with css after
      code: [
        'import { styled } from "next-yak";',
        "styled.button`",
        "${foo}",
        "margin-bottom: 10px;",
        "`",
      ].join("\n"),
      output: [
        'import { styled } from "next-yak";',
        "styled.button`",
        "${foo};",
        "margin-bottom: 10px;",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin with selector after
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  ${foo}",
        "  div { }",
        "`",
      ].join("\n"),
      output: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  ${foo};",
        "  div { }",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin within selector
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  div {",
        "    ${foo}",
        "  }",
        "`",
      ].join("\n"),
      output: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  div {",
        "    ${foo};",
        "  }",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin below single line selector
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  div { }",
        "  ${foo}",
        "`",
      ].join("\n"),
      output: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  div { }",
        "  ${foo};",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin with css before
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  color: red;",
        "  ${foo}",
        "`",
      ].join("\n"),
      output: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  color: red;",
        "  ${foo};",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin with arrow function expression before
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  ${({ $myVar }) => css`color: red;`}",
        "  ${foo}",
        "`",
      ].join("\n"),
      output: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  ${({ $myVar }) => css`color: red;`}",
        "  ${foo};",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin with empty line and arrow function expression before
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  ${({ $myVar }) => css`color: red;`}",
        " ",
        "  ${foo}",
        "`",
      ].join("\n"),
      output: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "  ${({ $myVar }) => css`color: red;`}",
        " ",
        "  ${foo};",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin in generic styled.div
      code: [
        'import { css, styled } from "next-yak";',
        "styled.div<{ $size: PopoverSize }>`",
        "  ${foo}",
        "`",
      ].join("\n"),
      output: [
        'import { css, styled } from "next-yak";',
        "styled.div<{ $size: PopoverSize }>`",
        "  ${foo};",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin with array expression
      code: [
        'import { css, styled } from "next-yak";',
        "styled.div`",
        " ${aspectRatioStyles['16/9']}",
        "`",
      ].join("\n"),
      output: [
        'import { css, styled } from "next-yak";',
        "styled.div`",
        " ${aspectRatioStyles['16/9']};",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
    {
      // Mixin with conditional expression before
      code: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "${",
        "$visuallyUnmounted &&",
        "css`",
        "  ${screenRangeQueries.desktopWidescreen} {",
        "    transform: translateY(0);",
        "  }",
        "`",
        "}",
        "  ${foo}",
        "`",
      ].join("\n"),
      output: [
        'import { css, styled } from "next-yak";',
        "styled.button`",
        "${",
        "$visuallyUnmounted &&",
        "css`",
        "  ${screenRangeQueries.desktopWidescreen} {",
        "    transform: translateY(0);",
        "  }",
        "`",
        "}",
        "  ${foo};",
        "`",
      ].join("\n"),
      errors: [{ messageId: "lonelyExpression" }],
    },
  ],
});
