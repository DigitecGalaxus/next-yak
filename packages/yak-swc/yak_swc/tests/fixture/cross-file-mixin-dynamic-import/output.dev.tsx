import { styled, __yak_use } from "next-yak/internal";
// @ts-ignore
import { highlight } from "./highlight";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// A cross-file mixin used at statement position (top level of the template).
// The transform can not know whether `highlight` is static or dynamic, so it
// - encodes a usage-site scope prefix into the css marker for the resolver
// - passes the imported value through __yak_use at runtime (no-op for static mixins)
export const Button = /*YAK EXPORTED STYLED:Button:input_Button_m7uBBu*//*YAK Extracted CSS:
:global(.input_Button_m7uBBu) {
  padding: 10px;
  --yak-css-import: url("./highlight:highlight",mixin,"input_Button__highlight_m7uBBu");
  color: green;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_button("input_Button_m7uBBu", __yak_use(highlight, "input_Button__highlight_m7uBBu")), {
    "displayName": "Button"
});
