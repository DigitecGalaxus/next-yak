import { css, styled } from "next-yak";
import { light, dark } from "@/tokens";
import ButtonLink from "./button-link";

const CtaButton = styled(ButtonLink)<{ $primary?: boolean }>`
  --btn-offset: 4px;
  padding: 14px 26px;
  gap: 9px;
  font-weight: 700;

  ${({ $primary }) =>
    $primary &&
    css`
      background: light-dark(${light.red}, ${dark.redDeep});
      color: white;
      --btn-edge: light-dark(${light.violet}, ${dark.black});
    `}
`;

export default CtaButton;
