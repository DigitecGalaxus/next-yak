import { styled } from "next-yak/internal";
import { lastChildMixin } from './mixin';
import * as __yak from "next-yak/internal";
import __styleYak from "./index.yak.module.css!=!./index?./index.yak.module.css";
var ListItem = /*YAK Extracted CSS:
.ListItem {
  margin-bottom: 10px;
  &:hover {
    --yak-css-import: url("./mixin:lastChildMixin",mixin);
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_li(__styleYak.ListItem), {
    "displayName": "ListItem"
});
export default ListItem;