"use client";

import { AnchorProvider, TOCItem } from "fumadocs-core/toc";
import type { TableOfContents, TOCItemType } from "fumadocs-core/toc";
import { useEffect, useRef, useState } from "react";
import { styled } from "next-yak";
import { light, dark } from "@/tokens";
import { sectionLabel } from "@/lib/mixins";

/**
 * On-page table of contents. `AnchorProvider` (fumadocs-core) wires the
 * intersection-observer that tracks the active headings; each `TOCItem` reflects it with a
 * `data-active` attribute.
 *
 * The rail is one SVG path over the active headings, and nothing is drawn anywhere else.
 * A border cannot do this: the active headings sit at different indents, and the path has
 * to turn a rounded corner where the indent steps.
 */
type Branch = { item: TOCItemType; children: Branch[] };

/** A flat list ordered by document position turns into a tree with one pass and a stack. */
function toBranches(items: readonly TOCItemType[]): Branch[] {
  const roots: Branch[] = [];
  const stack: Branch[] = [];
  for (const item of items) {
    const branch: Branch = { item, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].item.depth >= item.depth) stack.pop();
    (stack[stack.length - 1]?.children ?? roots).push(branch);
    stack.push(branch);
  }
  return roots;
}

function Level({ branches, nested = false }: { branches: Branch[]; nested?: boolean }) {
  return (
    <Rail $nested={nested}>
      {branches.map(({ item, children }) => (
        <div key={item.url}>
          <Item href={item.url}>{item.title}</Item>
          {children.length > 0 ? <Level branches={children} nested /> : null}
        </div>
      ))}
    </Rail>
  );
}

/**
 * The step geometry, in the shape fumadocs uses. The two control points cross in y, which
 * rounds both ends hard and still lets the middle cross on a diagonal. A curve with both
 * controls on the same vertical has to run flat across the middle, which reads as a bracket.
 */
const STEP_SPAN = 18;
const STEP_CONTROL = 12;

/**
 * How far the rail steps for each level. It is smaller than the 14px the text steps, so
 * the rail keeps its distance from the deeper rows instead of hugging them.
 */
const RAIL_STEP = 8;

/**
 * The whole rail, through every heading, plus the y band each step curve occupies. The
 * clip window decides how much of the rail shows, and the bands keep the cut off a curve.
 */
function railGeometry(list: HTMLElement): { d: string; bands: Array<[number, number]> } {
  const box = list.getBoundingClientRect();
  const raw = [...list.querySelectorAll<HTMLElement>("a")].map((el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left - box.left, top: r.top - box.top, bottom: r.bottom - box.top };
  });
  if (raw.length === 0) return { d: "", bands: [] };

  // The rail reads the level off the text indent and then sets its own, narrower spacing.
  // The stroke is 2px wide, so its centre sits 1px in.
  const levels = [...new Set(raw.map((r) => r.left))].sort((a, b) => a - b);
  const rows = raw.map((r) => ({ ...r, x: 1 + levels.indexOf(r.left) * RAIL_STEP }));

  const bands: Array<[number, number]> = [];
  let d = `M ${rows[0].x} ${rows[0].top}`;
  let x = rows[0].x;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const next = rows[i + 1];
    const steps = next !== undefined && next.x !== x;
    if (!steps) {
      d += ` L ${x} ${row.bottom}`;
      continue;
    }
    // The step straddles the boundary between the two headings, so the vertical above it
    // stops half a span early and the curve gets its whole height.
    const span = Math.min(STEP_SPAN, (row.bottom - row.top) * 0.9, (next.bottom - next.top) * 0.9);
    const control = (STEP_CONTROL * span) / STEP_SPAN;
    const from = next.top - span / 2;
    const to = next.top + span / 2;
    d += ` L ${x} ${from}`;
    d += ` C ${x} ${from + control} ${next.x} ${to - control} ${next.x} ${to}`;
    bands.push([from, to]);
    x = next.x;
  }
  return { d, bands };
}

/**
 * The vertical window over the active headings, in pixels down the list.
 *
 * A cut inside a step curve leaves a short hook hanging off the end of the rail, which is
 * the mark fumadocs covers with a dot. An edge that lands in a band moves clear of it
 * instead, so every cut falls on a straight run and there is nothing to cover.
 */
function activeWindow(
  list: HTMLElement,
  bands: Array<[number, number]>,
): { top: number; bottom: number } {
  const box = list.getBoundingClientRect();
  const active = [...list.querySelectorAll<HTMLElement>('[data-active="true"]')];
  if (active.length === 0) return { top: 0, bottom: 0 };
  const first = active[0].getBoundingClientRect();
  const last = active[active.length - 1].getBoundingClientRect();
  let top = first.top - box.top;
  let bottom = last.bottom - box.top;
  for (const [from, to] of bands) {
    if (top > from && top < to) top = to;
    if (bottom > from && bottom < to) bottom = from;
  }
  return { top, bottom: Math.max(top, bottom) };
}

export default function Toc({ toc }: { toc: TableOfContents }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [rail, setRail] = useState({ d: "", top: 0, bottom: 0 });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // The path stays the same as the reader scrolls, so only the window moves, and the
    // window is a css value that can transition. Redrawing the path instead would jump.
    const redraw = () => {
      const { d, bands } = railGeometry(list);
      setRail({ d, ...activeWindow(list, bands) });
    };
    redraw();
    // `data-active` moves as the reader scrolls, and the box reflows on a resize
    const mutation = new MutationObserver(redraw);
    mutation.observe(list, { attributes: true, attributeFilter: ["data-active"], subtree: true });
    const resize = new ResizeObserver(redraw);
    resize.observe(list);
    return () => {
      mutation.disconnect();
      resize.disconnect();
    };
  }, [toc]);

  if (!toc || toc.length === 0) return null;

  return (
    <AnchorProvider toc={toc}>
      <Heading>On this page</Heading>
      <Box>
        <Marker
          aria-hidden
          style={{
            clipPath: `polygon(0 ${rail.top}px, 100% ${rail.top}px, 100% ${rail.bottom}px, 0 ${rail.bottom}px)`,
          }}
        >
          <path d={rail.d} />
        </Marker>
        <div ref={listRef}>
          <Level branches={toBranches(toc)} />
        </div>
      </Box>
    </AnchorProvider>
  );
}

const Heading = styled.span`
  ${sectionLabel};
  display: block;
  margin-bottom: 10px;
`;

const Box = styled.div`
  position: relative;
`;

const Marker = styled.svg`
  position: absolute;
  inset: 0;
  /* An svg with no width or height carries an intrinsic 300x150 box. An inset cannot
     override a replaced element's own height, so the svg ran 150px tall and gave the
     scrolling rail around it something to scroll. */
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  fill: none;
  stroke: light-dark(${light.red}, ${dark.red});
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;

  @media (prefers-reduced-motion: no-preference) {
    transition: clip-path 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const Rail = styled.div<{ $nested: boolean }>`
  display: flex;
  flex-direction: column;
  /* a nested rail steps right by the same amount the text is inset */
  margin-left: ${({ $nested }) => ($nested ? "14px" : "0")};
`;

const Item = styled(TOCItem)`
  display: block;
  padding: 3px 0 3px 12px;
  font-size: 13px;
  line-height: 1.4;
  color: light-dark(${light.violetSoft}, ${dark.fog});
  text-decoration: none;

  @media (prefers-reduced-motion: no-preference) {
    transition: color 0.12s ease;
  }

  &:hover {
    color: light-dark(${light.violet}, ${dark.white});
  }

  &[data-active="true"] {
    color: light-dark(${light.violet}, ${dark.white});
  }
`;
