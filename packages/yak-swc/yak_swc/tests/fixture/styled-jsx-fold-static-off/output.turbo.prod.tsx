import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGNvbG9yOiByZWQ7Cn0=";
const Card = /*YAK Extracted CSS:
.ym7uBBu {
  color: red;
}
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu");
// With foldStatic off, JSX usages keep the runtime wrapper component instead of
// folding into a plain DOM element with a className.
const App = ()=><>
    <Card>runtime wrapper</Card>
    <Card className="user">runtime wrapper with className</Card>
  </>;
