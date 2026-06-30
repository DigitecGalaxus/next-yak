"use client";

import { Dialog } from "@base-ui-components/react/dialog";
import { useDocsSearch } from "fumadocs-core/search/client";
import type { SortedResult } from "fumadocs-core/search";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { css, styled } from "next-yak";
import { colors, fonts } from "@/tokens";
import { keycapStyles, backdropStyles } from "@/lib/mixins";
import { Highlight } from "./highlight";
import { SearchIcon } from "./search-icon";
import { searchClient } from "./search-config";

/**
 * Command-palette search built from base-ui `Dialog` (focus trap, scroll lock,
 * Escape + backdrop dismissal, portal) and fumadocs-core's `useDocsSearch`
 * (the query logic). The result list and its keyboard navigation are
 * hand-rolled — base-ui's Autocomplete gates Enter/selection on its own `open`
 * state, which conflicts with the Dialog's modal behaviour, so a small
 * controlled list (the same approach fumadocs itself ships) is cleaner here.
 */
export default function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { search, setSearch, query } = useDocsSearch({ ...searchClient, delayMs: 100 });
  const items = query.data && query.data !== "empty" ? query.data : [];
  const [active, setActive] = useState(0);

  // Re-anchor the highlight to the top whenever the result set changes.
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
  background: ${colors.beigeLight};
  border: 2.5px solid ${colors.violet};
  border-radius: 16px;
  box-shadow: 6px 6px 0 0 ${colors.violet};
  color: ${colors.violetLight};

  &:focus-visible {
    outline: none;
  }
`;

// Accessible label for the dialog; visually hidden.
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
  color: ${colors.violet};
  border-bottom: 2px solid ${colors.violet};
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-family: ${fonts.body};
  font-size: 16px;
  color: ${colors.violet};

  &::placeholder {
    color: ${colors.violetLight};
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
  color: ${colors.violetLight};
`;

const ResultLink = styled(Link)<{ $active: boolean; $nested: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 9px 12px;
  border-radius: 10px;
  scroll-margin: 8px;
  text-decoration: none;
  color: ${colors.violet};

  ${({ $nested }) =>
    $nested &&
    css`
      padding-left: 24px;
    `}

  ${({ $active }) =>
    $active &&
    css`
      background: ${colors.beigeDark};
    `}
`;

const Crumbs = styled.span`
  font-size: 11px;
  color: ${colors.violetLight};
`;

const Content = styled.span<{ $page: boolean }>`
  font-size: 14px;
  color: ${colors.violet};
  font-weight: ${({ $page }) => ($page ? 600 : 400)};
`;
