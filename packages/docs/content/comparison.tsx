import { css, styled } from "next-yak";

type Features =
  | "INP optimized"
  | "Zero Runtime"
  | "Zero SSR Overhead"
  | "Vanilla CSS Syntax"
  | "Using JS Constants in CSS"
  | "Mixins / JS Fragments"
  | "Type-safe cross file selectors"
  | "Type-safe CSS runtime values"
  | "Type-safe conditional styling"
  | "CSS Colocation"
  | "Collision-free class names"
  | "CSS Code Splitting by page"
  | "Compact HTML output"
  | "Zero Compile"
  | "Compile time optimized"
  | "Next.js"
  | "React"
  | "React Server Components"
  | "Vite"
  | "Framework agnostic";

const libraries = {
  Static: {
    "Vanilla CSS": {
      "INP optimized": true,
      "Zero Runtime": true,
      "Zero SSR Overhead": true,
      "Vanilla CSS Syntax": true,
      "Using JS Constants in CSS": false,
      "Mixins / JS Fragments": false,
      "Type-safe cross file selectors": false,
      "Type-safe CSS runtime values": false,
      "Type-safe conditional styling": false,
      "CSS Colocation": false,
      "Collision-free class names": false,
      "CSS Code Splitting by page": true,
      "Compact HTML output": true,
      "Zero Compile": true,
      "Compile time optimized": true,
      "Next.js": true,
      "React": true,
      "React Server Components": true,
      "Vite": true,
      "Framework agnostic": true,
    },
  },
  "Compile Time": {
    "Next-Yak": {
      "INP optimized": true,
      "Zero Runtime": true,
      "Zero SSR Overhead": true,
      "Vanilla CSS Syntax": true,
      "Using JS Constants in CSS": true,
      "Mixins / JS Fragments": true,
      "Type-safe cross file selectors": true,
      "Type-safe CSS runtime values": true,
      "Type-safe conditional styling": true,
      "CSS Colocation": true,
      "Collision-free class names": true,
      "CSS Code Splitting by page": true,
      "Compact HTML output": true,
      "Zero Compile": false,
      "Compile time optimized": true,
      "Next.js": true,
      "React": true,
      "React Server Components": true,
      "Vite": false,
      "Framework agnostic": false,
    },
    Tailwind: {
      "INP optimized": true,
      "Zero Runtime": true,
      "Zero SSR Overhead": true,
      "Vanilla CSS Syntax": false,
      "Using JS Constants in CSS": false,
      "Mixins / JS Fragments": true,
      "Type-safe cross file selectors": false,
      "Type-safe CSS runtime values": false,
      "Type-safe conditional styling": false,
      "CSS Colocation": true,
      "Collision-free class names": true,
      "CSS Code Splitting by page": false,
      "Compact HTML output": false,
      "Zero Compile": false,
      "Compile time optimized": true,
      "Next.js": true,
      "React": true,
      "React Server Components": true,
      "Vite": true,
      "Framework agnostic": true,
    },
    SCSS: {
      "INP optimized": true,
      "Zero Runtime": true,
      "Zero SSR Overhead": true,
      "Vanilla CSS Syntax": true,
      "Using JS Constants in CSS": false,
      "Mixins / JS Fragments": true,
      "Type-safe cross file selectors": false,
      "Type-safe CSS runtime values": false,
      "Type-safe conditional styling": false,
      "CSS Colocation": false,
      "Collision-free class names": false,
      "CSS Code Splitting by page": true,
      "Compact HTML output": true,
      "Zero Compile": false,
      "Compile time optimized": false,
      "Next.js": true,
      "React": true,
      "React Server Components": true,
      "Vite": true,
      "Framework agnostic": true,
    },
    "CSS Modules": {
      "INP optimized": true,
      "Zero Runtime": true,
      "Zero SSR Overhead": true,
      "Vanilla CSS Syntax": true,
      "Using JS Constants in CSS": false,
      "Mixins / JS Fragments": false,
      "Type-safe cross file selectors": false,
      "Type-safe CSS runtime values": false,
      "Type-safe conditional styling": false,
      "CSS Colocation": false,
      "Collision-free class names": true,
      "CSS Code Splitting by page": true,
      "Compact HTML output": true,
      "Zero Compile": false,
      "Compile time optimized": false,
      "Next.js": true,
      "React": true,
      "React Server Components": true,
      "Vite": true,
      "Framework agnostic": true,
    },
    StyleX: {
      "INP optimized": true,
      "Zero Runtime": true,
      "Zero SSR Overhead": true,
      "Vanilla CSS Syntax": false,
      "Using JS Constants in CSS": true,
      "Mixins / JS Fragments": true,
      "Type-safe cross file selectors": false,
      "Type-safe CSS runtime values": true,
      "Type-safe conditional styling": true,
      "CSS Colocation": true,
      "Collision-free class names": true,
      "CSS Code Splitting by page": false,
      "Compact HTML output": false,
      "Zero Compile": false,
      "Compile time optimized": false,
      "Next.js": true,
      "React": true,
      "React Server Components": true,
      "Vite": true,
      "Framework agnostic": true,
    },
    "Panda CSS": {
      "INP optimized": true,
      "Zero Runtime": true,
      "Zero SSR Overhead": true,
      "Vanilla CSS Syntax": true,
      "Using JS Constants in CSS": true,
      "Mixins / JS Fragments": true,
      "Type-safe cross file selectors": false,
      "Type-safe CSS runtime values": false,
      "Type-safe conditional styling": true,
      "CSS Colocation": true,
      "Collision-free class names": true,
      "CSS Code Splitting by page": false,
      "Compact HTML output": false,
      "Zero Compile": false,
      "Compile time optimized": false,
      "Next.js": true,
      "React": true,
      "React Server Components": true,
      "Vite": true,
      "Framework agnostic": true,
    },
    Linaria: {
      "INP optimized": true,
      "Zero Runtime": true,
      "Zero SSR Overhead": true,
      "Vanilla CSS Syntax": true,
      "Using JS Constants in CSS": true,
      "Mixins / JS Fragments": true,
      "Type-safe cross file selectors": false,
      "Type-safe CSS runtime values": true,
      "Type-safe conditional styling": true,
      "CSS Colocation": true,
      "Collision-free class names": true,
      "CSS Code Splitting by page": true,
      "Compact HTML output": true,
      "Zero Compile": false,
      "Compile time optimized": false,
      "Next.js": true,
      "React": true,
      "React Server Components": true,
      "Vite": true,
      "Framework agnostic": true,
    },
    "Vanilla Extract": {
      "INP optimized": true,
      "Zero Runtime": true,
      "Zero SSR Overhead": true,
      "Vanilla CSS Syntax": false,
      "Using JS Constants in CSS": true,
      "Mixins / JS Fragments": true,
      "Type-safe cross file selectors": true,
      "Type-safe CSS runtime values": true,
      "Type-safe conditional styling": true,
      "CSS Colocation": true,
      "Collision-free class names": true,
      "CSS Code Splitting by page": true,
      "Compact HTML output": true,
      "Zero Compile": false,
      "Compile time optimized": false,
      "Next.js": true,
      "React": true,
      "React Server Components": true,
      "Vite": true,
      "Framework agnostic": true,
    },
  },
  "Browser Runtime": {
    "Styled-Components": {
      "INP optimized": false,
      "Zero Runtime": false,
      "Zero SSR Overhead": false,
      "Vanilla CSS Syntax": true,
      "Using JS Constants in CSS": true,
      "Mixins / JS Fragments": true,
      "Type-safe cross file selectors": true,
      "Type-safe CSS runtime values": true,
      "Type-safe conditional styling": true,
      "CSS Colocation": true,
      "Collision-free class names": true,
      "CSS Code Splitting by page": true,
      "Compact HTML output": true,
      "Zero Compile": false,
      "Compile time optimized": true,
      "Next.js": true,
      "React": true,
      "React Server Components": false,
      "Vite": true,
      "Framework agnostic": false,
    },
    Emotion: {
      "INP optimized": false,
      "Zero Runtime": false,
      "Zero SSR Overhead": false,
      "Vanilla CSS Syntax": true,
      "Using JS Constants in CSS": true,
      "Mixins / JS Fragments": true,
      "Type-safe cross file selectors": true,
      "Type-safe CSS runtime values": true,
      "Type-safe conditional styling": true,
      "CSS Colocation": true,
      "Collision-free class names": true,
      "CSS Code Splitting by page": true,
      "Compact HTML output": true,
      "Zero Compile": false,
      "Compile time optimized": false,
      "Next.js": true,
      "React": true,
      "React Server Components": false,
      "Vite": true,
      "Framework agnostic": false,
    },
    Goober: {
      "INP optimized": false,
      "Zero Runtime": false,
      "Zero SSR Overhead": false,
      "Vanilla CSS Syntax": true,
      "Using JS Constants in CSS": true,
      "Mixins / JS Fragments": true,
      "Type-safe cross file selectors": true,
      "Type-safe CSS runtime values": true,
      "Type-safe conditional styling": true,
      "CSS Colocation": true,
      "Collision-free class names": true,
      "CSS Code Splitting by page": true,
      "Compact HTML output": true,
      "Zero Compile": true,
      "Compile time optimized": true,
      "Next.js": true,
      "React": true,
      "React Server Components": false,
      "Vite": true,
      "Framework agnostic": true,
    },
    Restyle: {
      "INP optimized": false,
      "Zero Runtime": false,
      "Zero SSR Overhead": true,
      "Vanilla CSS Syntax": false,
      "Using JS Constants in CSS": true,
      "Mixins / JS Fragments": true,
      "Type-safe cross file selectors": false,
      "Type-safe CSS runtime values": true,
      "Type-safe conditional styling": true,
      "CSS Colocation": true,
      "Collision-free class names": true,
      "CSS Code Splitting by page": true,
      "Compact HTML output": false,
      "Zero Compile": true,
      "Compile time optimized": true,
      "Next.js": true,
      "React": true,
      "React Server Components": true,
      "Vite": true,
      "Framework agnostic": false,
    },
  },
} as const satisfies Record<
  "Static" | "Compile Time" | "Browser Runtime",
  Record<string, Record<Features, boolean>>
>;

const categories = [
  "Static",
  "Compile Time",
  "Browser Runtime",
] as const satisfies Array<keyof typeof libraries>;
const features = libraries["Compile Time"]["Next-Yak"] satisfies Record<
  Features,
  boolean
>;
const sups = [
  "INP optimized",
  "Zero Runtime",
  "Zero SSR Overhead",
  "Compile time optimized",
] satisfies Array<Features>;

export const ComparisonTable = () => {
  return (
    <MaxWidth>
    <table>
      <thead>
        <tr>
          <th style={{background: "inherit"}}></th>
          {categories.map((category) => (
            <ColumnHead
              $newCategory
              key={category}
              colSpan={Object.keys(libraries[category]).length}
            >
              {category}
            </ColumnHead>
          ))}
        </tr>
        <tr>
        <th style={{background: "inherit"}}></th>
          {categories.map((category) =>
            Object.keys(libraries[category]).map((lib, i) => (
              <ColumnHead
                key={lib}
                $newCategory={i === 0}
              >
                {lib}
              </ColumnHead>
            ))
          )}
        </tr>
      </thead>
      <tbody>
        {Object.keys(features).map((feature) => (
          <tr key={feature}>
            <ColumnFeatureName>
              {feature}
              {sups.includes(feature as any) && (
                <sup style={{ marginLeft: "4px" }}>
                  {sups.indexOf(feature as any) + 1})
                </sup>
              )}
            </ColumnFeatureName>
            {categories.map((category) =>
              Object.values(libraries[category]).map((lib, i) => (
                <Column key={lib[feature]} $newCategory={i === 0}>
                  {lib[feature] ? <span
                    title={titleText(
                      feature,
                      Object.keys(libraries[category])[i],
                      true
                    )}
                  >✅</span> : <span
                    title={titleText(
                      feature,
                      Object.keys(libraries[category])[i],
                      false
                    )}
                  >❌</span>}
                </Column>
              ))
            )}
          </tr>
        ))}
      </tbody>
    </table></MaxWidth>
  );
};


const verbs = ["agnostic", "optimized"] as const;

const titleText = (featureName: string, libName: string, supported: boolean) => {
  const endsWithVerb = verbs.find((verb) => featureName.endsWith(verb));
  const term = endsWithVerb ? featureName.substring(0, featureName.length - endsWithVerb.length).trim() : featureName;
  const not = supported ? "" : "not ";
  if (endsWithVerb === "optimized") {
    return `${libName} is ${not}${endsWithVerb} for ${term}`;
  }
  if (endsWithVerb === "agnostic") {
    return `${libName} is ${not}${term} ${endsWithVerb}`;
  }
  const plural = featureName.endsWith("s") ? "are" : "is";
  return `${featureName} ${plural} ${not}supported by ${libName}`;
}

const MaxWidth = styled.div`
  max-width: 100%;
  overflow-x: auto;
  margin: 0 auto;
  padding: 0 2rem;
  @media (max-width: 900px) {
    padding: 0 0.5rem;
  }
`;


const ColumnHead = styled.td<{
  $newCategory?: boolean;
}>`
 text-align: center;
 font-weight: 600;
 white-space: nowrap;
  ${({ $newCategory }) =>
    $newCategory &&
    css`
    border-left: 1px solid var(--color-fd-accent-foreground);
  `}
  &:last-child {
    border-right: 1px solid var(--color-fd-accent-foreground);
  }
`;

const ColumnFeatureName = styled.td`
  text-align: left;
  white-space: nowrap;
  font-weight: 600;
  transition: background-color 500ms;
  padding-left: 3rem;
  padding-right: 1rem;
  @media (max-width: 900px) {
    padding-left: 1rem;
  }
  tr:hover & {
    color: var(--color-fd-accent);
    background-color: var(--color-fd-accent-foreground);
  }
`;

const Column = styled.td<{
  $newCategory?: boolean;
}>`
 text-align: center;
 cursor: default;
 transition: background-color 500ms;
  ${({ $newCategory }) =>
    $newCategory &&
    css`
    border-left: 1px solid var(--color-fd-accent-foreground);
  `}
  &:last-child {
    border-right: 1px solid var(--color-fd-accent-foreground);
  }
  tr:has(td:hover) & {
    background-color: var(--color-fd-accent-foreground);
  }
`;