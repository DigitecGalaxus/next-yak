import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
// Define styled components within an object
export const OtherComponents = {
    Title: /*YAK EXPORTED STYLED:OtherComponents.Title:input_OtherComponents_Title_m7uBBu*//*YAK Extracted CSS:
:global(.input_OtherComponents_Title_m7uBBu) {
  font-size: 5rem;
  font-weight: 400;
  color: hotpink;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_h1("input_OtherComponents_Title_m7uBBu"), {
        "displayName": "Title"
    }),
    Subtitle: /*YAK EXPORTED STYLED:OtherComponents.Subtitle:input_OtherComponents_Subtitle_m7uBBu*//*YAK Extracted CSS:
:global(.input_OtherComponents_Subtitle_m7uBBu) {
  font-size: 3rem;
  color: blue;
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_h2("input_OtherComponents_Subtitle_m7uBBu"), {
        "displayName": "Subtitle"
    })
};
// Test using the object property component in the same file
const Container = /*YAK Extracted CSS:
:global(.input_Container_m7uBBu) {
  padding: 20px;
  :global(.input_OtherComponents_Title_m7uBBu) {
    color: purple;
  }
  :global(.input_OtherComponents_Subtitle_m7uBBu) {
    margin-top: 10px;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_Container_m7uBBu"), {
    "displayName": "Container"
});
export default Container;