"use client";
import { notFound } from "next/navigation";
import Link from "next/link";
import React, { useState, use } from "react";
import { styled, css } from "next-yak";

import { benchmarks, type BenchmarkEntry } from "../manifest";

import { KanjiLetterComponentYak } from "../../../bench/generated/KanjiLetterComponent.next-yak";
import { KanjiLetterComponentStyled } from "../../../bench/generated/KanjiLetterComponent.styled-components";
import { PureComponentsYak } from "../../../bench/generated/PureComponents.next-yak";
import { PureComponentsStyled } from "../../../bench/generated/PureComponents.styled-components";
import { AttrsComponentsYak } from "../../../bench/generated/AttrsComponents.next-yak";
import { AttrsComponentsStyled } from "../../../bench/generated/AttrsComponents.styled-components";
import { CssPropComponentsYak } from "../../../bench/generated/CssPropComponents.next-yak";
import { CssPropComponentsStyled } from "../../../bench/generated/CssPropComponents.styled-components";
import { DynamicPropsComponentsYak } from "../../../bench/generated/DynamicPropsComponents.next-yak";
import { DynamicPropsComponentsStyled } from "../../../bench/generated/DynamicPropsComponents.styled-components";
import { NestedComponentsYak } from "../../../bench/generated/NestedComponents.next-yak";
import { NestedComponentsStyled } from "../../../bench/generated/NestedComponents.styled-components";
import { TreeYak } from "../../../bench/generated/Tree.next-yak";
import { TreeStyled } from "../../../bench/generated/Tree.styled-components";
import { SierpinskiYak } from "../../../bench/generated/Sierpinski.next-yak";
import { SierpinskiStyled } from "../../../bench/generated/Sierpinski.styled-components";
import { CrossRequestCacheYak } from "../../../bench/generated/CrossRequestCache.next-yak";
import { CrossRequestCacheStyled } from "../../../bench/generated/CrossRequestCache.styled-components";
import { TreeDeepYak } from "../../../bench/generated/TreeDeep.next-yak";
import { TreeDeepStyled } from "../../../bench/generated/TreeDeep.styled-components";
import { TreeWideYak } from "../../../bench/generated/TreeWide.next-yak";
import { TreeWideStyled } from "../../../bench/generated/TreeWide.styled-components";
import { IdiomaticTreeYak } from "../../../bench/generated/IdiomaticTree.next-yak";
import { IdiomaticTreeStyled } from "../../../bench/generated/IdiomaticTree.styled-components";
import { IdiomaticDynamicPropsComponentsYak } from "../../../bench/generated/IdiomaticDynamicProps.next-yak";
import { IdiomaticDynamicPropsComponentsStyled } from "../../../bench/generated/IdiomaticDynamicProps.styled-components";

// Maps slug -> { yak, styled } component pair. Source-imported (not the
// .compiled variants) so the next-yak webpack loader extracts the CSS the
// same way it would in a real Next.js app.
const components: Record<string, { Yak: React.FC<any>; Styled: React.FC<any> }> = {
  "kanji-letter": { Yak: KanjiLetterComponentYak, Styled: KanjiLetterComponentStyled },
  "pure-components": { Yak: PureComponentsYak, Styled: PureComponentsStyled },
  "attrs-components": { Yak: AttrsComponentsYak, Styled: AttrsComponentsStyled },
  "css-prop": { Yak: CssPropComponentsYak, Styled: CssPropComponentsStyled },
  "dynamic-props": { Yak: DynamicPropsComponentsYak, Styled: DynamicPropsComponentsStyled },
  "nested-components": { Yak: NestedComponentsYak, Styled: NestedComponentsStyled },
  tree: { Yak: TreeYak, Styled: TreeStyled },
  sierpinski: { Yak: SierpinskiYak, Styled: SierpinskiStyled },
  "cross-request-cache": { Yak: CrossRequestCacheYak, Styled: CrossRequestCacheStyled },
  "tree-deep": { Yak: TreeDeepYak, Styled: TreeDeepStyled },
  "tree-wide": { Yak: TreeWideYak, Styled: TreeWideStyled },
  "idiomatic-tree": { Yak: IdiomaticTreeYak, Styled: IdiomaticTreeStyled },
  "idiomatic-dynamic-props": {
    Yak: IdiomaticDynamicPropsComponentsYak,
    Styled: IdiomaticDynamicPropsComponentsStyled,
  },
};

const Page = styled.div`
  font-family: system-ui, sans-serif;
  padding: 16px;
  color: #222;
`;

const BackLink = styled.p`
  margin-bottom: 8px;
`;

const Title = styled.h1`
  margin: 0 0 4px;
`;

const Subtitle = styled.p`
  margin: 0 0 16px;
  color: #555;
`;

const Grid = styled.div`
  display: flex;
  gap: 16px;
  align-items: stretch;
`;

const Cell = styled.section`
  flex: 1;
  min-width: 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
`;

const CellHeading = styled.h2`
  margin-top: 0;
  font-size: 16px;
`;

// Sierpinski/dot benchmarks paint via absolute positioning; the contained
// surface gives them a box so they don't escape to (0,0). Other benchmarks
// just render in flow.
const Surface = styled.div<{ $contained?: boolean }>`
  ${(p) =>
    p.$contained &&
    css`
      position: relative;
      min-height: 280px;
      contain: paint;
      overflow: auto;
    `}
`;

const ToggleButton = styled.button`
  margin-bottom: 8px;
`;

function CrossRequestCacheDemo({ Component }: { Component: React.FC<{ count: number }> }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <ToggleButton onClick={() => setCount((c) => c + 1)}>
        Re-render parent (count: {count})
      </ToggleButton>
      <Component count={count} />
    </div>
  );
}

function renderDemo(entry: BenchmarkEntry, Component: React.FC<any>): React.ReactElement {
  if (entry.slug === "cross-request-cache") {
    return <CrossRequestCacheDemo Component={Component} />;
  }
  return <Component {...(entry.defaultProps ?? {})} />;
}

export default function BenchmarkViewer({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const entry = benchmarks.find((b) => b.slug === slug);
  const pair = components[slug];
  if (!entry || !pair) notFound();

  return (
    <Page>
      <BackLink>
        <Link href="/">← all benchmarks</Link>
      </BackLink>
      <Title>{entry.name}</Title>
      <Subtitle>{entry.description}</Subtitle>
      <Grid>
        <Cell>
          <CellHeading>next-yak</CellHeading>
          <Surface $contained={entry.containedSurface}>{renderDemo(entry, pair.Yak)}</Surface>
        </Cell>
        <Cell>
          <CellHeading>styled-components</CellHeading>
          <Surface $contained={entry.containedSurface}>{renderDemo(entry, pair.Styled)}</Surface>
        </Cell>
      </Grid>
    </Page>
  );
}
