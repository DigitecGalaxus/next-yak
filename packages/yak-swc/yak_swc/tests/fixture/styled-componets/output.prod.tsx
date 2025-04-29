// @ts-ignore
import styled from "styled-components";
import { styled as styledYak } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.css!=!./input?./input.yak.css";
const textColor = "red";
// Should be transformed as it is yak
export const CustomThemedButton = /*YAK EXPORTED STYLED:CustomThemedButton:ym7uBBu*//*YAK Extracted CSS:
.ym7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ __yak.__yak_button("ym7uBBu");
// Should not be transformed as it is NOT yak
export const StyledComponent = styled.button`
  color: ${textColor};
`;
