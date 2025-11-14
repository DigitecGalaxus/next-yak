import { styled } from 'next-yak';
import { buttonMixin } from './mixin';
import { primaryButtonMixin } from './helper/anotherMixin';

export const Button = styled.button<{ $hasIcon: boolean; $disabled: boolean }>`
  ${buttonMixin};
`;

export const PrimaryButton = styled(Button)`
  ${primaryButtonMixin};
`;
