"use client";

import { css, styled } from "next-yak";
import { buttonStyles } from "./button";
import { useSearch } from "../search/search-provider";
import { SearchIcon } from "../search/search-icon";
import { keycapStyles } from "@/lib/mixins";

export default function Search({
  fullWidth,
  onClick,
}: {
  fullWidth?: boolean;
  onClick?: () => void;
}) {
  const { setOpen } = useSearch();

  return (
    <Input
      type="button"
      onClick={() => {
        onClick?.();
        setOpen(true);
      }}
      $fullWidth={fullWidth}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: 10px;
        `}
      >
        <SearchIcon size={16} />

        <span>Search</span>
      </div>

      <kbd
        css={css`
          ${keycapStyles};
          letter-spacing: 0.72px;
        `}
      >
        ⌘K
      </kbd>
    </Input>
  );
}

const Input = styled.button<{ $fullWidth?: boolean }>`
  ${buttonStyles};

  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 230px;
  max-height: 38px;
  padding: 8px 12px;

  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}
`;
