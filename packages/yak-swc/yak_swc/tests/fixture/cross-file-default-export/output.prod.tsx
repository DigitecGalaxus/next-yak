import { styled } from "next-yak/internal";
import DefaultComponent from "./external-component";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// Component that targets a default exported styled component from another file
export const TestCard = /*YAK EXPORTED STYLED:TestCard:ym7uBBu*//*YAK Extracted CSS:
:global(.ym7uBBu) {
  border: 1px solid #ddd;
  padding: 15px;
  --yak-css-import: url("./external-component:default",selector) {
    background: lightblue;
    color: white;
  }
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu");
