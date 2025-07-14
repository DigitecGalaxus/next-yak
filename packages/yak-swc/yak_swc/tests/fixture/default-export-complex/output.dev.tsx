import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// Multiple variable declarations - only one will be default exported
const Button = /*YAK Extracted CSS:
:global(.input_Button_m7uBBu) {
  background: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_Button_m7uBBu"), {
    "displayName": "Button"
});
const Title = /*YAK Extracted CSS:
:global(.input_Title_m7uBBu) {
  color: blue;
  font-size: 24px;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_h1("input_Title_m7uBBu"), {
    "displayName": "Title"
});
const Container = /*YAK Extracted CSS:
:global(.input_Container_m7uBBu) {
  padding: 20px;
  background: yellow;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Container_m7uBBu"), {
    "displayName": "Container"
});
// Only Container is default exported
/*YAK EXPORTED STYLED:default:input_Container_m7uBBu*//*YAK Extracted CSS:
:global(.input_Container_m7uBBu) {
  padding: 20px;
  background: yellow;
}
*/ export default Container;
// Button is named exported
export { Button };
