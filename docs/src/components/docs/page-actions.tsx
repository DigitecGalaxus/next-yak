"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { css, styled } from "@yak/react";
import { fontWeight, light, dark } from "@/tokens";
import { chromeLink, focusRing } from "@/lib/mixins";
import { Icon } from "@/components/icon";
import { asset } from "@/lib/site";

/** Copy or open the Markdown version of a docs page (served by app/llms.mdx). */
export function PageActions({ markdownUrl }: { markdownUrl: string }) {
  const href = asset(markdownUrl);
  const { copied, copy } = useCopyMarkdown(href);

  return (
    <Actions>
      <ActionButton type="button" onClick={copy} aria-live="polite">
        <Icon viewBox="0 0 24 24" aria-hidden="true">
          {copied ? (
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.5" />
          ) : (
            <>
              <rect
                x="9"
                y="9"
                width="11"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                stroke="currentColor"
                strokeWidth="2"
              />
            </>
          )}
        </Icon>
        {copied ? "Copied" : "Copy page"}
      </ActionButton>
      <ActionLink href={href} rel="nofollow" type="text/markdown">
        <Icon viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 6h16v12H4zM7 15V9l2.5 3L12 9v6M16 9v6m-2-2l2 2 2-2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </Icon>
        Markdown
      </ActionLink>
    </Actions>
  );
}

// The fetch result goes to the clipboard as a promise: Safari only allows clipboard writes
// that start in the click handler, so awaiting the fetch first would fail there.
function useCopyMarkdown(href: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    const text = fetch(href).then((response) => response.text());
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": text.then((t) => new Blob([t], { type: "text/plain" })),
        }),
      ]);
    } catch {
      try {
        await navigator.clipboard.writeText(await text);
      } catch {
        return;
      }
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  }, [href]);

  return { copied, copy };
}

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const action = css`
  ${chromeLink};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 14px;
  font-weight: ${fontWeight.semibold};
  color: light-dark(${light.violetSoft}, ${dark.fog});
  cursor: pointer;

  &:focus-visible {
    ${focusRing};
  }
`;

const ActionButton = styled.button`
  ${action};
`;

const ActionLink = styled.a`
  ${action};
`;
