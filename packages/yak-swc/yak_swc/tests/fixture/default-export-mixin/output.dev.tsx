import { css } from "next-yak/internal";
import { otherMixin } from "./otherMixin";
const highlight = /*YAK EXPORTED MIXIN:highlight
color: red;
background: yellow;
font-weight: bold;
--yak-css-import: url("./otherMixin:otherMixin",mixin);
*/ /*#__PURE__*/ css();
export default /*YAK EXPORTED MIXIN:default
color: red;
background: yellow;
font-weight: bold;
--yak-css-import: url("./otherMixin:otherMixin",mixin);
*/ highlight;
