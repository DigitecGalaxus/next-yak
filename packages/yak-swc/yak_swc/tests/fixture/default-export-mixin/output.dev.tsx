import { css, __yak_use, __yak_mixin } from "next-yak/internal";
import { otherMixin } from "./otherMixin";
const highlight = /*YAK EXPORTED MIXIN V2:highlight
color: red;
background: yellow;
font-weight: bold;
--yak-css-import: url("./otherMixin:otherMixin",mixin,@s0);
*/ /*#__PURE__*/ __yak_mixin((__yak_b)=>[
        __yak_use(otherMixin, __yak_b.sub(0))
    ]);
export default /*YAK EXPORTED MIXIN V2:default
color: red;
background: yellow;
font-weight: bold;
--yak-css-import: url("./otherMixin:otherMixin",mixin,@s0);
*/ highlight;
