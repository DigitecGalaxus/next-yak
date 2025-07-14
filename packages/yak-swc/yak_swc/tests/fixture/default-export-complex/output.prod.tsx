import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// Multiple variable declarations - only one will be default exported
const Button = /*YAK EXPORTED STYLED:Button:input_Button_m7uBBu*//*YAK Extracted CSS:
:global(.input_Button_m7uBBu) {
  background: red;
}
*//*#__PURE__*/ __yak.__yak_button("input_Button_m7uBBu");
const Title = /*YAK Extracted CSS:
:global(.input_Title_m7uBBu) {
  color: blue;
  font-size: 24px;
}
*//*#__PURE__*/ __yak.__yak_h1("input_Title_m7uBBu");
const Container = /*YAK EXPORTED STYLED:default:input_default_m7uBBu*//*YAK Extracted CSS:
:global(.input_default_m7uBBu) {
  padding: 20px;
  background: yellow;
}
*//*#__PURE__*/ __yak.__yak_div("input_default_m7uBBu");
// Only Container is default exported
export default Container;
// Button is named exported
export { Button };