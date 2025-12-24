import { styled, css } from 'next-yak';

const buttonTextMixin = css<{ $disabled: boolean }>`
  color: black;
  ${({ $disabled }) => $disabled && css`opacity: 0.5;`}
`;

const Button = styled.button<{ $hasIcon: boolean; $disabled: boolean }>`
  ${buttonTextMixin};
  ${({ $hasIcon }) => $hasIcon && css`
    padding-left: 30px;
  `}
  ${({ $disabled }) => $disabled && css`
    color: gray;
  `}
`;

export default Button;