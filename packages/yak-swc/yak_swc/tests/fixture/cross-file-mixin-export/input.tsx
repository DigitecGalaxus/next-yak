import { css, styled } from "next-yak";
import { typographyMixin } from "./typography";

const textColor = css`
  color: black;
`;

const textStyles = css`
  font-size: 16px;
  ${textColor};
`;

export const buttonStyles = css`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  ${textStyles};
  ${typographyMixin};
`;

export const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    ${({ $isSet }) => $isSet && true && true && true && textStyles};
  }
  &:focus {
    ${textStyles};
    ${textStyles};
  }
`;

export const aspectRatios = {
  base: css`
    padding-top: 100%;
  `,
  "16:9": css`
    padding-top: 56.25%;
  `,
  "4:3": css`
    padding-top: 75%;
  `,
}