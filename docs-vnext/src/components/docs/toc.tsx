"use client";

import { AnchorProvider, TOCItem } from "fumadocs-core/toc";
import type { TableOfContents, TOCItemType } from "fumadocs-core/toc";
import { useEffect, useRef, useState } from "react";
import { styled } from "next-yak";
import { light, dark } from "@/tokens";
import { sectionLabel } from "@/lib/mixins";

// The active-heading marker is one SVG path through all headings, clipped to the active
// ones. A border cannot curve where the indent steps between levels.
type Branch = { item: TOCItemType; children: Branch[] };

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

// Bezier step between indent levels. The control points cross in y so the middle runs diagonal.
const STEP_SPAN = 18;
const STEP_CONTROL = 12;

// Less than the 14px text indent, so the rail keeps clear of deeper rows
const RAIL_STEP = 8;

function railGeometry(list: HTMLElement): { d: string; bands: Array<[number, number]> } {
  const box = list.getBoundingClientRect();
  const raw = [...list.querySelectorAll<HTMLElement>("a")].map((el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left - box.left, top: r.top - box.top, bottom: r.bottom - box.top };
  });
  if (raw.length === 0) return { d: "", bands: [] };

  // Level comes from the text indent. The 2px stroke is centred 1px in.
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
    // The step is centred on the boundary between the two headings
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

// Clip edges that land inside a step curve move out of it, so no hook is left at the cut.
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
    // Only the clip window changes on scroll, so it can transition
    const redraw = () => {
      const { d, bands } = railGeometry(list);
      setRail({ d, ...activeWindow(list, bands) });
    };
    redraw();
    const mutation = new MutationObserver(redraw);
    mutation.observe(list, { attributes: true, attributeFilter: ["data-active"], subtree: true });
    const resize = new ResizeObserver(redraw);
    resize.observe(list);
    return () => {
      mutation.disconnect();
      resize.disconnect();
    };
  }, [toc]);

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
  /* inset alone keeps the svg's intrinsic 150px height */
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
