import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
const Card = /*YAK Extracted CSS:
:global(.input_Card_m7uBBu) {
  color: red;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Card_m7uBBu"), {
    "displayName": "Card"
});
// With foldStatic off, JSX usages keep the runtime wrapper component instead of
// folding into a plain DOM element with a className.
const App = ()=><>
    <Card>runtime wrapper</Card>
    <Card className="user">runtime wrapper with className</Card>
  </>;
