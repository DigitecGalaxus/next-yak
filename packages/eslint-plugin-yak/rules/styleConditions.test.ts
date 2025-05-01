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
      // Invalid because it's returning a constant (the value is not from props)
      code: "import { css, styled } from 'next-yak'; css`color: ${({variant}) => variant === 'primary' ? `red`: 'blue'}`",
      errors: [{ messageId: "invalidRuntimeReturnValue" }],
    },
    {
      // Invalid because it's returning a constant (the value is not from props)
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
      errors: [{ messageId: "invalidRuntimeReturnValue" }],
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
      // Invalid because it's returning a css literal for a css declaration
      code: "import { css, styled } from 'next-yak'; styled.button`color: ${({variant}) => variant === 'primary' && css`color: red`}`",
      errors: [{ messageId: "invalidCssReturnValue" }],
    },
  ],
});
