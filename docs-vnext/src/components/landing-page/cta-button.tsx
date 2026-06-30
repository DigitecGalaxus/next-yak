import { css, styled } from "next-yak";
import { colors } from "@/tokens";
import ButtonLink from "./button-link";

const CtaButton = styled(ButtonLink)<{ $primary?: boolean }>`
  padding: 14px 26px;
  gap: 9px;
  font-weight: 700;

  ${({ $primary }) =>
    $primary &&
    css`
      background: ${colors.red};
      color: white;
    `}
`;

export default CtaButton;
