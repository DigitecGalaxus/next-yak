import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import __styleYak from "./input.yak.module.css!=!./input?./input.yak.module.css";
export const ResponsiveGrid = /*YAK Extracted CSS:
.ResponsiveGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding: 20px;
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div(__styleYak.ResponsiveGrid), {
    "displayName": "ResponsiveGrid"
});
