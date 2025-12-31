import { styled } from "next-yak";
import { thumbSize, trackArea } from "./identDefinitions";

export const Slider = styled.div`
  ${thumbSize.name}: 24px;
  width: ${thumbSize};
  grid-area: ${trackArea};
`;
