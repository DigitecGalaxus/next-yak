// @ts-ignore
import styled from "styled-components";
import { styled as styledYak } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.css!=!./input?./input.yak.css";
const textColor = "red";
// Should be transformed as it is yak
export const CustomThemedButton = /*YAK EXPORTED STYLED:CustomThemedButton:input_CustomThemedButton_m7uBBu*//*YAK Extracted CSS:
.input_CustomThemedButton_m7uBBu {
  color: blue;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_CustomThemedButton_m7uBBu"), {
    "displayName": "CustomThemedButton"
});
// Should not be transformed as it is NOT yak
export const StyledComponent = styled.button`
  color: ${textColor};
`;
