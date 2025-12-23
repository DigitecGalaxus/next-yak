import { styled, ident } from "next-yak";

const thumbSize = ident`--thumb-size`;
const trackArea = ident`track`;

export const Slider = styled.div`
  ${thumbSize.name}: 24px;
  width: ${thumbSize};
  grid-area: ${trackArea};
`;
