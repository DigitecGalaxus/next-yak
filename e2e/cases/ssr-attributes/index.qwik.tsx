import { $ } from "@qwik.dev/core";
import { css, styled } from "@yak/qwik";

// qwik escapes text children, a style tag too; raw css goes in as innerHTML
const RawStyle = styled.style``;
const rawCss = '[data-testid="raw-target"]::before { content: "<&"; }';

// The same props go through a static and a dynamic styled component, on a
// div and on an a, so the test can compare the markup they produce.
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

// a component target that spreads its props into a native element; the
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
  lang: "de",
  // qwik runs no ref callback after resume, so the mark that the dom is live
  // comes from the visibility event the qwikloader dispatches
  onQVisible$: $((_: Event, el: Element) => el.setAttribute("data-ref", "1")),
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
      {/* attrs keep these on the runtime path in both fold modes */}
      <StyledSpread data-testid="spread-target" $green>
        text
      </StyledSpread>
      <RawStyle dangerouslySetInnerHTML={rawCss} />
      <span data-testid="raw-target">raw</span>
      <DynamicDiv
        data-testid="unread-div"
        $tone="rgb(0, 0, 0)"
        dangerouslySetInnerHTML="<b>raw</b>"
      />
      <DynamicAnchor
        data-testid="unread-a"
        $tone="rgb(0, 0, 0)"
        dangerouslySetInnerHTML="<b>raw</b>"
      />
    </div>
  );
}
