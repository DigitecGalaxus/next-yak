import { styled } from "next-yak";

// React twin of the Solid case: the same props on a styled div and a styled a,
// once static and once with attrs and a dynamic style.
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

const special = {
  "data-on": true,
  "data-off": false,
  "data-empty": "",
  "data-none": undefined,
  "data-num": 0,
  "data-text": 'a&b"c<d>',
  hidden: false,
  className: "user active",
  style: { marginTop: "4px", backgroundColor: "rgb(1, 2, 3)" },
  title: "t",
  lang: "de",
  ref: (el: HTMLElement | null) => el?.setAttribute("data-ref", "1"),
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
      <DynamicDiv
        data-testid="unread-div"
        $tone="rgb(0, 0, 0)"
        dangerouslySetInnerHTML={{ __html: "<b>raw</b>" }}
      />
      <DynamicAnchor
        data-testid="unread-a"
        $tone="rgb(0, 0, 0)"
        dangerouslySetInnerHTML={{ __html: "<b>raw</b>" }}
      />
    </div>
  );
}
