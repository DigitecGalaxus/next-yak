import { styled } from "next-yak";
import { colors, fontSize } from "@/tokens";
import { overline } from "@/lib/mixins";

const Eyebrow = styled.span`
  ${overline};
  color: ${colors.red};
  font-size: ${fontSize.eyebrow};
  letter-spacing: 1.82px;
`;

export default Eyebrow;
