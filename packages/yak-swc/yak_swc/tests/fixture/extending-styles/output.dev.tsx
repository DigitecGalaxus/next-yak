import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
const BaseButton = /*YAK Extracted CSS:
.BaseButton {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button(__styleYak.BaseButton), {
    "displayName": "BaseButton"
});
export const PrimaryButton = /*YAK Extracted CSS:
.PrimaryButton {
  background-color: #007bff;
  color: #fff;
  &:hover {
    background-color: #0056b3;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(BaseButton)(__styleYak.PrimaryButton), {
    "displayName": "PrimaryButton"
});
export const SecondaryButton = /*YAK Extracted CSS:
.SecondaryButton {
  background-color: #6c757d;
  color: #fff;
  &:hover {
    background-color: #545b62;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ styled(BaseButton)(__styleYak.SecondaryButton), {
    "displayName": "SecondaryButton"
});
