import { styled } from "next-yak";
import { inlineCode } from "@/lib/mixins";

const Code = styled.code`
  ${inlineCode};
  white-space: nowrap;
`;

export default Code;
