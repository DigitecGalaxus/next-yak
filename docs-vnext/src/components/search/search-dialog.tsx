"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useDocsSearch } from "fumadocs-core/search/client";
import type { SortedResult } from "fumadocs-core/search";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { css, styled } from "next-yak";
import { fonts, light, dark } from "@/tokens";
import { keycapStyles, backdropStyles } from "@/lib/mixins";
import { asset } from "@/lib/site";
import { SearchIcon } from "./search-icon";

// base-ui Autocomplete gates Enter on its own `open` state, which conflicts with the
// modal Dialog, so the result list and its keyboard handling are hand-rolled.
export default function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { search, setSearch, query } = useDocsSearch({
    type: "static",
    from: asset("/api/search"),
    delayMs: 100,
  });
  const items = query.data && query.data !== "empty" ? query.data : [];
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [query.data]);

  function select(item: SortedResult) {
    onOpenChange(false);
    router.push(item.url);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (items.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[active];
      if (item) select(item);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Backdrop />
        <Popup>
          <Title>Search documentation</Title>
          <Header>
            <SearchIcon size={18} aria-hidden="true" />
            <Input
              autoFocus
              type="text"
              placeholder="Search documentation…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onInputKeyDown}
              aria-label="Search documentation"
            />
            <Esc type="button" onClick={() => onOpenChange(false)}>
              esc
            </Esc>
          </Header>

          <Results>
            {search.length === 0 ? (
              <Status>Type to search the documentation…</Status>
            ) : query.isLoading ? (
              <Status>Searching…</Status>
            ) : items.length === 0 ? (
              <Status>No results for “{search}”.</Status>
            ) : (
              items.map((item, i) => (
                <ResultLink
                  key={item.id}
                  href={item.url}
                  $active={i === active}
                  $nested={item.type === "heading" || item.type === "text"}
                  onClick={() => onOpenChange(false)}
                  onMouseMove={() => setActive(i)}
                  ref={(el: HTMLAnchorElement | null) => {
                    if (i === active && el) el.scrollIntoView({ block: "nearest" });
                  }}
                >
                  {item.breadcrumbs && item.breadcrumbs.length > 0 ? (
                    <Crumbs>{item.breadcrumbs.join(" › ")}</Crumbs>
                  ) : null}
                  <Content $page={item.type === "page"}>
                    <Highlight text={typeof item.content === "string" ? item.content : ""} />
                  </Content>
                </ResultLink>
              ))
            )}
          </Results>
        </Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Snippets wrap matches in <mark>. Rendering the rest as text keeps it escaped.
function Highlight({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(/<mark>([\s\S]*?)<\/mark>/g)) {
    const start = match.index;
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
    nodes.push(<Mark key={start}>{match[1]}</Mark>);
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

const Backdrop = styled(Dialog.Backdrop)`
  ${backdropStyles};
  z-index: 50;
`;

const Popup = styled(Dialog.Popup)`
  position: fixed;
  left: 50%;
  top: 12vh;
  transform: translateX(-50%);
  z-index: 51;
  display: flex;
  flex-direction: column;
  width: min(640px, calc(100vw - 32px));
  max-height: 70vh;
  overflow: hidden;
  background: light-dark(${light.beige1}, ${dark.navy1});
  border: 2.5px solid light-dark(${light.violet}, ${dark.white});
  border-radius: 16px;
  box-shadow: 6px 6px 0 0 light-dark(${light.violet}, ${dark.white});
  color: light-dark(${light.violetSoft}, ${dark.fog});

  &:focus-visible {
    outline: none;
  }
`;

const Title = styled(Dialog.Title)`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  color: light-dark(${light.violet}, ${dark.white});
  border-bottom: 2px solid light-dark(${light.violet}, ${dark.white});
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-family: ${fonts.body};
  font-size: 16px;
  color: light-dark(${light.violet}, ${dark.white});

  &::placeholder {
    color: light-dark(${light.violetSoft}, ${dark.fog});
  }

  &:focus {
    outline: none;
  }
`;

const Esc = styled.button`
  ${keycapStyles};
  flex: 0 0 auto;
  cursor: pointer;
`;

const Results = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  overflow-y: auto;
`;

const Status = styled.div`
  padding: 36px 12px;
  text-align: center;
  font-size: 14px;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

const ResultLink = styled(Link)<{ $active: boolean; $nested: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 9px 12px;
  border-radius: 10px;
  scroll-margin: 8px;
  text-decoration: none;
  color: light-dark(${light.violet}, ${dark.white});

  ${({ $nested }) =>
    $nested &&
    css`
      padding-left: 24px;
    `}

  ${({ $active }) =>
    $active &&
    css`
      background: light-dark(${light.beige3}, ${dark.navy3});
    `}
`;

const Crumbs = styled.span`
  font-size: 13px;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

const Content = styled.span<{ $page: boolean }>`
  font-size: 14px;
  color: light-dark(${light.violet}, ${dark.white});
  font-weight: ${({ $page }) => ($page ? 600 : 400)};
`;

const Mark = styled.mark`
  background: transparent;
  color: light-dark(${light.red}, ${dark.red});
  font-weight: 700;
`;
