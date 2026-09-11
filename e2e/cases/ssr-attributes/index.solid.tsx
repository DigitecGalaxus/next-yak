import { styled } from "@yak/solid";

// Two SSR paths render styled tags: a direct writer for most tags and Solid's
// ssrElement for the tags that can be HTML or SVG (a, script, style, title).
// The same props go through both, once static and once with attrs and a
// dynamic style, so the test can compare the markup they produce.
const StaticDiv = styled.div`
  padding: 1px;
`;
const StaticAnchor = styled.a`
  padding: 1px;
`;
const DynamicDiv = styled.div.attrs({ "data-attrs": "yes" })<{ $tone: string }>`
  padding: 1px;
  color: ${(props) => props.$tone};
`;
const DynamicAnchor = styled.a.attrs({ "data-attrs": "yes" })<{ $tone: string }>`
  padding: 1px;
  color: ${(props) => props.$tone};
`;

// every kind of value the serializer treats specially
const special = {
  "data-on": true,
  "data-off": false,
  "data-empty": "",
  "data-none": undefined,
  "data-num": 0,
  "data-text": 'a&b"c<d>',
  hidden: false,
  class: ["user", { active: true, off: false }],
  style: "margin-top: 4px; background-color: rgb(1, 2, 3)",
  title: "t",
  "prop:lang": "de",
  ref: (el: HTMLElement) => el.setAttribute("data-ref", "1"),
  onClick: () => {},
} as Record<string, never>;

export default function App() {
  return (
    <div>
      <StaticDiv data-testid="static-div" {...special}>
        text
      </StaticDiv>
      <StaticAnchor data-testid="static-a" {...special}>
        text
      </StaticAnchor>
      <DynamicDiv data-testid="dynamic-div" $tone="rgb(255, 0, 0)" {...special}>
        text
      </DynamicDiv>
      <DynamicAnchor data-testid="dynamic-a" $tone="rgb(255, 0, 0)" {...special}>
        text
      </DynamicAnchor>
    </div>
  );
}
