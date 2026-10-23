"use client";

import { css, styled } from "@yak/react";
import { buttonStyles } from "./button";
import { useSearch } from "../search/search-provider";
import { SearchIcon } from "../search/search-icon";
import { keycapStyles, visuallyHidden } from "@/lib/mixins";
import { screen } from "@/tokens";

export default function Search() {
  const { setOpen } = useSearch();

  return (
    <Input type="button" onClick={() => setOpen(true)}>
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: 10px;
        `}
      >
        <SearchIcon size={16} />

        <Label>Search</Label>
      </div>

      <Keycap>⌘K</Keycap>
    </Input>
  );
}

/* stays in the accessibility tree when hidden, so the icon button keeps its name */
const Label = styled.span``;

const Keycap = styled.kbd`
  ${keycapStyles};
  letter-spacing: 0.72px;
`;

const Input = styled.button`
  ${buttonStyles};

  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 230px;
  max-height: 38px;
  padding: 8px 12px;

  /* an icon button like its neighbours, so the header links keep one line */
  @container header (max-width: ${screen.searchCompact}) {
    justify-content: center;
    width: 40px;
    height: 40px;
    max-height: none;
    padding: 0;

    ${Label} {
      ${visuallyHidden};
    }

    ${Keycap} {
      display: none;
    }
  }
`;
