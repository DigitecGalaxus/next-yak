import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";
import { styleConditions } from "./styleConditions.js";

RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester({ languageOptions: { parser: tsParser } });

ruleTester.run("yak-style-conditions", styleConditions, {
  valid: [
    {
      // Valid because it's a runtime value from props
      code: "import { css } from 'next-yak'; css`color: ${({color}) => color}`",
    },
    {
      // Valid because it's returning a css literal
      code: "import { css } from 'next-yak'; css`${({variant}) => variant === 'primary' && css`color: red`}`",
    },
    {
      // Valid because it's returning a css literal or a runtime value
      code: "import { css } from 'next-yak'; css`${({variant, colors}) => variant === 'primary' && css`color: ${colors.primary}`}`",
    },
    {
      // Valid because it's returning a runtime value
      code: "import { css, styled } from 'next-yak'; styled.button`color: ${({color}) => color}`",
    },
    {
      // Valid because it's returning a css literal
      code: "import { css, styled } from 'next-yak'; styled.button`${({variant}) => variant === 'primary' && css`color: red`}`",
    },
    {
      // Valid because it's returning a runtime value
      code: "import { css, styled } from 'next-yak'; styled.button`${({variant, primary}) => variant === 'primary' && css`color: ${primary}`}`",
    },
    {
      // Valid because it's returning a css literal
      code: "import { css, styled } from 'next-yak'; css`${({variant}) => variant === 'primary' ? css`color: red` : null}`",
    },
    {
      // Valid because it's returning a css literal
      code: "import { css, styled } from 'next-yak'; styled.button`${({variant}) => variant === 'primary' ? css`color: red` : undefined}`",
    },
    {
      // Valid because it's returning a css literal
      code: "import { css, styled } from 'next-yak'; css`${({variant}) => { if (variant === 'primary') { return css`color: red` } }}`",
    },
    {
      // Valid because it's returning css literals and/or runtime values
      code: "import { css, styled } from 'next-yak'; css`${({variant, color}) => { if (variant === 'primary') { return css`color: red` } else if (color) { return css`color: ${color}` } }}`",
    },
    {
      // Valid because it's returning a runtime value
      code: "import { css, styled } from 'next-yak'; css`${5}`",
    },
    {
      // Valid because it's returning a runtime value
      code: "import { css, styled } from 'next-yak'; css`width: ${({$digit}) => `${5 * $digit}px`}`",
    },
    {
      // Valid because it's returning a runtime value
      code: "import { css, styled } from 'next-yak'; css`width: ${({$digit}) => `${5 * $digit + 'px'}`}`",
    },
    {
      // Valid because the call result depends on a runtime value from props
      code: `
        import { styled } from "next-yak";

        const spacing = { 8: "8px" };

        const Grid = styled.div\`
          grid-template-columns: repeat(
            auto-fit,
            minmax(
              calc(
                \${({ $baseWidth }) => Math.max(6, $baseWidth)}ch + 3 * \${spacing[8]}
              ),
              1fr
            )
          );
        \`;
      `,
    },
    {
      // Valid because the called function comes from props
      code: 'import { styled } from "next-yak"; styled.div`width: ${({ $formatter }) => $formatter(6)};`',
    },
    {
      // Valid because the called method comes from props
      code: 'import { styled } from "next-yak"; styled.div`width: ${({ $theme }) => $theme.spacing(2)};`',
    },
    {
      // Valid because a spread argument comes from props
      code: 'import { styled } from "next-yak"; styled.div`width: ${({ $widths }) => Math.max(...$widths)}px;`',
    },
    {
      // Valid unary conditional
      code: "import { css, styled } from 'next-yak'; css`${({ $visible = false }) => !$visible ? css`display: block;` : css`display: none;`}`",
    },
    // Ignored because it's not next-yak
    {
      code: "import { css } from 'styled-components'; css`color: ${() => color}`",
    },
    {
      // Valid because it's calling a function and returning a css literal
      code: "import { css } from 'next-yak'; css`${({$variant}) => isPrimary($variant) && css`color: red`}`",
    },
    {
      // Valid because it's calling a function and returning a css literal
      code: "import { css } from 'next-yak'; import { color } from 'sth'; css`${({$variant}) => isPrimary($variant) && css`color: ${color}`}`",
    },
    {
      // Valid because it's calling a function and returning a css literal with a runtime value
      code: "import { css, styled } from 'next-yak'; styled.button`${({$variant, $primary}) => isSpecialVariant($variant) && css`color: ${$primary}`}`",
    },
    {
      code: 'import { styled } from "next-yak"; styled.button`background-color: ${({ $backgroundColor }) => $backgroundColor ? $backgroundColor : "transparent"};`',
    },
    {
      code:
        'import { styled } from "next-yak"; import sth from "sth";' +
        "styled.button`background-color: ${({ $backgroundColor }) => $backgroundColor ? $backgroundColor : sth.transparent};`",
    },
    {
      code:
        'import { styled } from "next-yak";' +
        "styled.div`margin-top: ${({ index }) => -index * 30}px;`",
    },
    {
      code:
        'import { styled } from "next-yak";' +
        "const Input = styled.input.attrs<{ $size?: string }>((props) => ({type: 'text'}))<{ $size?: string }>``;",
    },
    {
      code:
        'import { styled } from "next-yak";' +
        "const Button = ''; const Input = styled(Button).attrs<{ $size?: string }>((props) => ({type: 'text'}))<{ $size?: string }>``;",
    },
  ],
  invalid: [
    {
      // Invalid because it's returning a constant (the value is not from props)
      code: "import { css, styled } from 'next-yak'; css`color: ${() => color}`",
      errors: [{ messageId: "invalidRuntimeReturnValue" }],
    },
    {
      // Invalid because none of the call's dependencies come from props
      code: "import { styled } from 'next-yak'; styled.div`width: ${() => Math.max(6, baseWidth)}px;`",
      errors: [{ messageId: "invalidRuntimeReturnValue" }],
    },
    {
      // Invalid because it's returning a constant (the value is not from props)
      // Both branches are literals, so a concrete before/after example is shown.
      code: "import { css, styled } from 'next-yak'; css`color: ${({variant}) => variant === 'primary' ? `red`: 'blue'}`",
      errors: [
        {
          messageId: "invalidRuntimeReturnValueWithExample",
          data: {
            property: "color",
            before: "color: ${({variant}) => variant === 'primary' ? `red`: 'blue'}",
            after: "color: blue;\n  ${({variant}) => variant === 'primary' && css`color: red;`}",
            example: "css`color: red;`",
          },
        },
      ],
    },
    {
      // Invalid because it's returning a constant (the value is not from props)
      // `&& colors.primary` is not a literal, so the generic message is used.
      code: "import { css, styled } from 'next-yak'; css`color: ${({variant}) => variant === 'primary' && colors.primary}`",
      errors: [{ messageId: "invalidRuntimeReturnValue" }],
    },
    {
      // Invalid because it's returning a constant (the value is not from props)
      code: "import { css, styled } from 'next-yak'; styled.button`color: ${() => color}`",
      errors: [{ messageId: "invalidRuntimeReturnValue" }],
    },
    {
      // Invalid because it's returning a constant (the value is not from props)
      code: "import { css, styled } from 'next-yak'; styled.button`color: ${() => { if (variant === 'primary') { return primary } else { return secondary } }}`",
      errors: [
        { messageId: "invalidRuntimeReturnValue" },
        { messageId: "invalidRuntimeReturnValue" },
      ],
    },
    {
      // Invalid because it's returning a constant (the value is not from props)
      code: "import { css, styled } from 'next-yak'; styled.button`color: ${({variant}) => variant === 'primary' ? `red`: 'blue'}`",
      errors: [{ messageId: "invalidRuntimeReturnValueWithExample" }],
    },
    {
      // Real-world incident: an enum ternary returning number literals.
      code: 'import { css, styled } from "next-yak"; styled.span`z-index: ${({ $kind }) => $kind === "second" ? 4 : 3};`',
      errors: [
        {
          messageId: "invalidRuntimeReturnValueWithExample",
          data: {
            property: "z-index",
            before: 'z-index: ${({ $kind }) => $kind === "second" ? 4 : 3}',
            after: 'z-index: 3;\n  ${({ $kind }) => $kind === "second" && css`z-index: 4;`}',
            example: "css`z-index: 4;`",
          },
        },
      ],
    },
    {
      // Enum ternary returning string literals — quotes are stripped in the example.
      code: 'import { css, styled } from "next-yak"; styled.span`background: ${({ $starting }) => $starting ? "#d8b4fe" : "#f6c453"};`',
      errors: [
        {
          messageId: "invalidRuntimeReturnValueWithExample",
          data: {
            property: "background",
            before: 'background: ${({ $starting }) => $starting ? "#d8b4fe" : "#f6c453"}',
            after:
              "background: #f6c453;\n  ${({ $starting }) => $starting && css`background: #d8b4fe;`}",
            example: "css`background: #d8b4fe;`",
          },
        },
      ],
    },
    {
      // `&&` with a literal value renders a single-line example (no default branch).
      code: 'import { css, styled } from "next-yak"; styled.span`color: ${({ $on }) => $on && "red"};`',
      errors: [
        {
          messageId: "invalidRuntimeReturnValueWithExample",
          data: {
            property: "color",
            before: 'color: ${({ $on }) => $on && "red"}',
            after: "${({ $on }) => $on && css`color: red;`}",
            example: "css`color: red;`",
          },
        },
      ],
    },
    {
      // Invalid because it's returning a constant (the value is not from props)
      code: "import { css, styled } from 'next-yak'; styled.button`color: ${({variant}) => variant === 'primary' && colors.primary}`",
      errors: [{ messageId: "invalidRuntimeReturnValue" }],
    },
    {
      // Invalid because it's returning a constant (the value is not from props)
      code: "import { css, styled } from 'next-yak'; styled('button')`color: ${({variant}) => variant === 'primary' && colors.primary}`",
      errors: [{ messageId: "invalidRuntimeReturnValue" }],
    },
    {
      // Invalid because it's returning a constant (the value is not from props)
      code: "import { css as cssYak, styled } from 'next-yak'; cssYak`color: ${() => color}`",
      errors: [{ messageId: "invalidRuntimeReturnValue" }],
    },
    {
      // css literal already holds a full declaration under an outer property -> the
      // fix (remove the outer property) can't be shown cleanly, so fall back to generic.
      code: "import { css, styled } from 'next-yak'; styled.button`color: ${({variant}) => variant === 'primary' && css`color: red`}`",
      errors: [{ messageId: "invalidCssReturnValue" }],
    },
    {
      // css trap, case A: a static value split out from its property -> move it in.
      code: 'import { css, styled } from "next-yak"; styled.span`color: ${({ $variant }) => $variant === "primary" && css`red`};`',
      errors: [
        {
          messageId: "invalidCssReturnValueMoveProperty",
          data: {
            property: "color",
            cssLiteral: "css`red`",
            example: "css`color: red;`",
            before: 'color: ${({ $variant }) => $variant === "primary" && css`red`}',
            after: '${({ $variant }) => $variant === "primary" && css`color: red;`}',
          },
        },
      ],
    },
    {
      // css trap, case B: a prop-derived value wrapped in css -> drop the css``.
      code: 'import { css, styled } from "next-yak"; styled.div`width: ${({ $w }) => css`${$w}px`};`',
      errors: [
        {
          messageId: "invalidCssReturnValueDropCss",
          data: {
            property: "width",
            value: "${$w}px",
            before: "width: ${({ $w }) => css`${$w}px`}",
            after: "width: ${({ $w }) => `${$w}px`}",
          },
        },
      ],
    },
    {
      // css trap, case A with an aliased css import -> the alias is preserved.
      code: 'import { css as cssYak, styled } from "next-yak"; styled.span`z-index: ${({ $kind }) => $kind === "second" && cssYak`4`};`',
      errors: [
        {
          messageId: "invalidCssReturnValueMoveProperty",
          data: {
            property: "z-index",
            cssLiteral: "cssYak`4`",
            example: "cssYak`z-index: 4;`",
            before: 'z-index: ${({ $kind }) => $kind === "second" && cssYak`4`}',
            after: '${({ $kind }) => $kind === "second" && cssYak`z-index: 4;`}',
          },
        },
      ],
    },
  ],
});
