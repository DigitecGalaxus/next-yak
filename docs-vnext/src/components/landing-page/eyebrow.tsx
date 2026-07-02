import { styled } from "next-yak";
import { fontSize, light, dark } from "@/tokens";
import { overline } from "@/lib/mixins";

const Eyebrow = styled.span`
  ${overline};
  color: light-dark(${light.red}, ${dark.red});
  font-size: ${fontSize.eyebrow};
  letter-spacing: 1.82px;
`;

export default Eyebrow;
