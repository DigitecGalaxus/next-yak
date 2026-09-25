"use client";

import { useRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { styled } from "next-yak";
import { fonts, shadow, status, syntax, light, dark, ink } from "@/tokens";
import { editorSurface, editorHeader, editorScrollbar } from "@/lib/mixins";
import { useCopy } from "@/lib/use-copy";

export function CodeBlock({
  title,
  icon,
  children,
  ...preProps
}: ComponentPropsWithoutRef<"pre"> & { icon?: string }) {
  const preRef = useRef<HTMLPreElement>(null);

  return (
    <Figure>
      {title ? (
        <TitleBar>
          {icon ? <Icon aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} /> : null}
          <TitleText>{title}</TitleText>
        </TitleBar>
      ) : null}
      <CopyButton getText={() => preRef.current?.textContent ?? ""} />
      <Pre ref={preRef} {...preProps}>
        {children}
      </Pre>
    </Figure>
  );
}

function CopyButton({ getText }: { getText: () => string }) {
  const { copied, copy } = useCopy();

  return (
    <Copy
      type="button"
      onClick={() => copy(getText())}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Copy>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const Figure = styled.figure`
  ${editorSurface};
  position: relative;
  margin: 16px 0;
`;

const TitleBar = styled.div`
  ${editorHeader};
  /* room for the copy button */
  padding-right: 44px;
  font-family: ${fonts.mono};
  font-size: 13px;
  color: ${ink.fgMuted};
`;

const Icon = styled.span`
  display: inline-flex;
  width: 15px;
  height: 15px;

  & svg {
    width: 15px;
    height: 15px;
  }
`;

const TitleText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Copy = styled.button`
  position: absolute;
  top: 7px;
  right: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1.5px solid ${ink.border};
  border-radius: 7px;
  background: ${ink.fill};
  color: ${syntax.fg};
  cursor: pointer;
  opacity: 0;

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity 0.12s ease;
  }

  figure:hover &,
  &:focus-visible {
    opacity: 1;
  }

  @media (hover: none) {
    opacity: 1;
  }
`;

const Pre = styled.pre`
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  ${editorScrollbar};
  font-family: ${fonts.mono};
  font-size: 13.5px;
  line-height: 1.6;
  color: light-dark(var(--shiki-light), var(--shiki-dark));
  background: transparent;

  & code {
    font-family: inherit;
  }

  /* shiki sets --shiki-light/-dark on each token span */
  & span {
    color: light-dark(var(--shiki-light), var(--shiki-dark));
  }

  & .line {
    display: inline-block;
    width: 100%;
  }
  & .line.diff.add {
    background: color-mix(in srgb, ${status.success} 16%, transparent);
  }
  & .line.diff.remove {
    background: color-mix(in srgb, ${status.error} 16%, transparent);
  }
  & .line.highlighted {
    background: ${ink.fill};
  }

  & .twoslash-error {
    background: color-mix(in srgb, ${status.error} 16%, transparent);
    border-bottom: 2px dotted ${status.error};
  }
  & .twoslash-highlighted {
    background: ${ink.hover};
    border-radius: 3px;
  }

  /* twoslash completions render as raw <ul>/<li>, not through the popup component */
  & .twoslash-completion-cursor {
    position: relative;
    display: inline-flex;
    flex-direction: column;
  }
  & .twoslash-completion-cursor::before {
    content: "";
    width: 1px;
    height: 1.3em;
    background: ${ink.success};
  }
  & .twoslash-completion-list {
    user-select: none;
    display: flex;
    flex-direction: column;
    gap: 1px;
    width: max-content;
    max-width: 320px;
    margin: 2px 0 6px;
    padding: 4px;
    list-style: none;
    border: 1px solid light-dark(${light.violetSoft}, ${dark.fog});
    border-radius: 8px;
    background: ${ink.popover};
    box-shadow: ${shadow.popover};
    color: ${ink.fg};
  }
  & .twoslash-completion-list li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 13px;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  & .twoslash-completion-list .twoslash-completions-icon {
    width: 1em;
    height: 1em;
    flex: none;
    color: ${ink.fgSubtle};
  }
  & .twoslash-completion-list .twoslash-completions-icon svg {
    display: block;
    width: 1em;
    height: 1em;
  }
  & .twoslash-completion-list .twoslash-completions-unmatched {
    color: ${ink.fgMuted};
  }
`;
