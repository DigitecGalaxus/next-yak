import { Fragment, type ReactNode } from "react";
import { styled } from "next-yak";
import { light, dark } from "@/tokens";

// fumadocs returns result snippets as text with `<mark>…</mark>` wrapping the
// matched terms. We render those marks as highlights and everything else as
// plain text — React escapes the plain parts, so this is XSS-safe. Snippets are
// essentially prose, so we deliberately don't pull in a full Markdown runtime.
const MARK_RE = /<mark>([\s\S]*?)<\/mark>/g;

export function Highlight({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MARK_RE)) {
    const start = match.index ?? 0;
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
    nodes.push(<Mark key={start}>{match[1]}</Mark>);
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </>
  );
}

const Mark = styled.mark`
  background: transparent;
  color: light-dark(${light.red}, ${dark.red});
  font-weight: 700;
`;
