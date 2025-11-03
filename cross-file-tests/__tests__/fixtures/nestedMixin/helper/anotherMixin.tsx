import { css } from 'next-yak';
import { buttonMixin } from '../mixin';
import { typography } from './typography';

export const primaryButtonMixin = css`
    ${buttonMixin};
    color: green;
    ${typography.h1}
`;