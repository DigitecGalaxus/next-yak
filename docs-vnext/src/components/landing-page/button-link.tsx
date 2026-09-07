import Link from "next/link";
import { centeredButton } from "./button";
import { styled } from "next-yak";

// `min-` rather than fixed 40px so CtaButton (which extends this) can grow with its padding.
const ButtonLink = styled(Link)`
  ${centeredButton};
  min-width: 40px;
  min-height: 40px;
`;

export default ButtonLink;
