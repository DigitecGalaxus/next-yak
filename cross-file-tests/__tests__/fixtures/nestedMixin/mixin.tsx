import { css } from 'next-yak';
import { Icon } from './icon';

const buttonTextMixin = css`
  color: black;
`;

export const buttonMixin = css`
  ${buttonTextMixin};
  ${Icon} {
    ${buttonTextMixin};
  }
`;