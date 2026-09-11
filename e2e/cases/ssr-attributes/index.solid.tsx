import { css, styled } from "@yak/solid";
import { isServer } from "@solidjs/web";

// the server reads only the first child prop; a second one must stay unread,
// it may render a component and take hydration ids the client will not take
const unreadChildProp = () => {
  if (isServer) throw new Error("the unused child prop was read on the server");
  return "client";
};

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

// a component target that spreads its props into a native element: the
// props it receives go through Solid's ssrElement on the server. the
// conditional class keeps the component dynamic without any style value
const Spread = (props: Record<string, unknown>) => <p {...props} />;
const StyledSpread = styled(Spread)<{ $green?: boolean }>`
  ${(props) =>
    props.$green &&
    css`
      color: rgb(0, 128, 0);
    `}
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
      {/* attrs keep these on the runtime path in both fold modes; a folded
          native element lets the Solid compiler evaluate textContent itself */}
      <StyledSpread data-testid="spread-target" $green>
        text
      </StyledSpread>
      <DynamicDiv
        data-testid="unread-div"
        $tone="rgb(0, 0, 0)"
        innerHTML="<b>raw</b>"
        textContent={unreadChildProp()}
      />
      <DynamicAnchor
        data-testid="unread-a"
        $tone="rgb(0, 0, 0)"
        innerHTML="<b>raw</b>"
        textContent={unreadChildProp()}
      />
    </div>
  );
}
