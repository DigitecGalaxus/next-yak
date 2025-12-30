"use client";
import { theme } from "@/lib/utils/constants";
import { css, styled } from "next-yak";
import { useState } from "react";

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
      React: true,
      "React Server Components": true,
      Vite: true,
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
      React: true,
      "React Server Components": true,
      Vite: false,
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
      React: true,
      "React Server Components": true,
      Vite: true,
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
      React: true,
      "React Server Components": true,
      Vite: true,
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
      React: true,
      "React Server Components": true,
      Vite: true,
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
      React: true,
      "React Server Components": true,
      Vite: true,
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
      React: true,
      "React Server Components": true,
      Vite: true,
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
      React: true,
      "React Server Components": true,
      Vite: true,
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
      React: true,
      "React Server Components": true,
      Vite: true,
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
      React: true,
      "React Server Components": false,
      Vite: true,
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
      React: true,
      "React Server Components": false,
      Vite: true,
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
      React: true,
      "React Server Components": false,
      Vite: true,
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
      React: true,
      "React Server Components": true,
      Vite: true,
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
  const [activeLibrary, setActiveLibrary] = useState<string>("Next-Yak");
  const columnHoverEvents = (library: string) => ({
    onMouseOver: () => {
      setActiveLibrary(library);
    },
    onMouseOut: () => {
      setActiveLibrary((prev) => {
        if (prev === library) {
          return "Next-Yak";
        }
        return prev;
      });
    },
  });

  return (
    <MaxWidth>
      <Table>
        <thead>
          <tr>
            <ColumnHead style={{ borderBottomWidth: 0 }} $active={false} />
            {categories.map((category) => (
              <ColumnHead
                $newCategory
                $active={false}
                key={category}
                colSpan={Object.keys(libraries[category]).length}
              >
                {category}
              </ColumnHead>
            ))}
          </tr>
          <tr>
            <ColumnHead $active={false} />
            {categories.map((category) =>
              Object.keys(libraries[category]).map((lib, i) => (
                <ColumnHead
                  key={lib}
                  $newCategory={i === 0}
                  {...columnHoverEvents(lib)}
                  $active={activeLibrary === lib}
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
              <ColumnFeatureName {...columnHoverEvents("")}>
                {feature}
                {sups.includes(feature as any) && (
                  <sup style={{ marginLeft: "4px" }}>
                    {sups.indexOf(feature as any) + 1})
                  </sup>
                )}
              </ColumnFeatureName>
              {categories.map((category) =>
                Object.values(libraries[category]).map((lib, i) => (
                  <Column
                    key={Object.keys(libraries[category])[i]}
                    $newCategory={i === 0}
                    {...columnHoverEvents(Object.keys(libraries[category])[i])}
                    $active={
                      activeLibrary === Object.keys(libraries[category])[i]
                    }
                  >
                    {lib[feature] ? (
                      <IconYes
                        title={titleText(
                          feature,
                          Object.keys(libraries[category])[i],
                          true
                        )}
                      />
                    ) : (
                      <IconNo
                        title={titleText(
                          feature,
                          Object.keys(libraries[category])[i],
                          false
                        )}
                      />
                    )}
                  </Column>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </MaxWidth>
  );
};

const verbs = ["agnostic", "optimized"] as const;

const titleText = (
  featureName: string,
  libName: string,
  supported: boolean
) => {
  const endsWithVerb = verbs.find((verb) => featureName.endsWith(verb));
  const term = endsWithVerb
    ? featureName.substring(0, featureName.length - endsWithVerb.length).trim()
    : featureName;
  const not = supported ? "" : "not ";
  if (endsWithVerb === "optimized") {
    return `${libName} is ${not}${endsWithVerb} for ${term}`;
  }
  if (endsWithVerb === "agnostic") {
    return `${libName} is ${not}${term} ${endsWithVerb}`;
  }
  const plural = featureName.endsWith("s") ? "are" : "is";
  return `${featureName} ${plural} ${not}supported by ${libName}`;
};

const MaxWidth = styled.div`
  width: 100%;
  max-width: 100%;
  overflow: auto;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  @media (max-width: 900px) {
    padding: 0 0.5rem;
  }
`;

const Table = styled.table`
  --table-background: hsl(0, 0%, 94.7%);
  --table-highlight-fg: hsl(0, 0%, 0%);
  --table-highlight: hsla(0, 0%, 94.7%, 0.5);
  --table-highlight-border: hsla(0, 0%, 94.7%, 0.5);
  --cell-background: var(--color-fd-card);
  --border-color: rgba(0, 0, 0, 0);
  --border-color-light: hsla(0, 0%, 94.7%, 0.7);
  border-color: var(--border-color-light);

  ${theme.dark} {
    --table-highlight:hsl(0deg 5.08% 16.34%);
    --table-highlight-fg: hsl(0, 0%, 100%);
    --table-background: hsl(0, 0%, 9.8%);
    --border-color-light: hsla(0, 0%, 9.8%, 0.5);
    background: linear-gradient(45deg, #d1c170, #ed8080, #d1c170) -100%/ 200%;
  }
  background: linear-gradient(45deg, #d1c170, #ed8080, #d1c170) -100%/ 200%;

  & td {
    border-color: var(--border-color-light);
    background-clip: padding-box;
  }
`;

const ColumnHead = styled.td<{
  $newCategory?: boolean;
  $active: boolean;
}>`
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  background-color: var(--cell-background);
  ${({ $newCategory }) =>
    $newCategory &&
    css`
      && {
        border-left: 1px solid var(--table-highlight-border);
      }
    `}
  ${({ $active }) =>
    $active &&
    css`
      --cell-background: var(--table-highlight);
      color: var(--table-highlight-fg);
    `}
`;

export const IconYes = styled.span`
  color: var(--table-highlight-fg);
  &::before {
    content: "✓" / "supported";
  }
  color: #0f840e;
  ${theme.dark} {
    color: #2faf1e;
  }
`;

export const IconNo = styled.span`
  color: var(--table-highlight-fg);
  &::before {
    content: "✘" / "not supported";
  }
  color: #aa1313;
  ${theme.dark} {
    color: #ca3333;
  }
`;

const ColumnFeatureName = styled.td`
  text-align: left;
  white-space: nowrap;
  font-weight: 600;
  padding-left: 3rem;
  padding-right: 1rem;
  background-color: var(--cell-background);
  @media (max-width: 900px) {
    padding-left: 1rem;
  }
  tr:hover & {
    color: var(--table-highlight-fg);
    background-color: var(--table-highlight);
  }
`;

const Column = styled.td<{
  $newCategory?: boolean;
  $active: boolean;
}>`
  text-align: center;
  cursor: default;
  min-width: 6rem;
  background-color: var(--cell-background);
  tr:has(td:hover) & {
    background-color: var(--table-highlight);
    border-color: var(--border-color-light);
  }
  ${({ $newCategory }) =>
    $newCategory &&
    css`
      &&& {
        border-left: 1px solid var(--table-highlight-border);
      }
    `}

  ${({ $active }) =>
    $active &&
    css`
      --cell-background: var(--table-highlight);
    `}
`;
