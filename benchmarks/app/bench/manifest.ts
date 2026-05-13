// Manifest of every benchmark and how it should render in the browser.
// Shared between the index page and the [slug] viewer.

export type BenchmarkProps = {
  count?: number;
};

export type BenchmarkEntry = {
  slug: string;
  name: string;
  description: string;
  // Prop overrides for the <Yak/Styled /> component. Most benchmarks render
  // with no props.
  defaultProps?: BenchmarkProps;
  // Whether to render the demo on a contained surface (Sierpinski uses
  // absolute positioning and would otherwise sit at viewport 0,0).
  containedSurface?: boolean;
};

export const benchmarks: BenchmarkEntry[] = [
  {
    slug: "kanji-letter",
    name: "KanjiLetterComponent",
    description: "2500 Kanji characters, simple styled.div with media query.",
  },
  {
    slug: "pure-components",
    name: "PureComponents",
    description: "1000 styled.div with static color/padding/etc.",
  },
  {
    slug: "attrs-components",
    name: "AttrsComponents",
    description: "1000 styled.div with .attrs() default props.",
  },
  {
    slug: "css-prop",
    name: "CssPropComponents",
    description:
      "1000 inline styles per element. Yak: <div css={...}>. Styled: styled.div per instance.",
  },
  {
    slug: "dynamic-props",
    name: "DynamicPropsComponents",
    description:
      "1000 components with $primary/$size/$variant/$disabled prop branches as CSS-variable interpolations.",
  },
  {
    slug: "nested-components",
    name: "NestedComponents",
    description: "200 components extended through 5 levels of styled(Parent).",
  },
  {
    slug: "tree",
    name: "Tree",
    description: "Recursive Box tree (~1875 boxes), industry-standard mount benchmark.",
  },
  {
    slug: "sierpinski",
    name: "SierpinskiTriangle",
    description: "Recursive 243 dots with dynamic position/size/color via CSS variables.",
    containedSurface: true,
  },
  {
    slug: "cross-request-cache",
    name: "CrossRequestCache",
    description:
      "Six SSR mounts of a parent with 200 stable-prop children. Exercises each library's cross-render style cache.",
    defaultProps: { count: 0 },
  },
  {
    slug: "tree-deep",
    name: "TreeDeep",
    description: "Tree with breadth=2/depth=9 (deep recursion).",
  },
  {
    slug: "tree-wide",
    name: "TreeWide",
    description: "Tree with breadth=750/depth=1 (wide sibling fan-out).",
  },
  {
    slug: "idiomatic-tree",
    name: "IdiomaticTree",
    description:
      "Tree with finite-enum props ($layout/$outer/$color) rewritten as class toggles via css``.",
  },
  {
    slug: "idiomatic-dynamic-props",
    name: "IdiomaticDynamicProps",
    description:
      "DynamicPropsComponents rewritten with class toggles for every $primary/$size/$variant/$disabled branch.",
  },
];
