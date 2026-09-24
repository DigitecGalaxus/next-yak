"use client";

import { useSyncExternalStore } from "react";
import { css, styled } from "next-yak";
import { fontWeight } from "@/tokens";
import { iconButton } from "./button";

type Theme = "system" | "light" | "dark";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const LABELS: Record<Theme, string> = { system: "System", light: "Light", dark: "Dark" };

// The pre-paint script in app/layout.tsx reads the same storage key and attribute.
function applyTheme(theme: Theme) {
  const el = document.documentElement;
  try {
    if (theme === "system") {
      delete el.dataset.theme;
      localStorage.removeItem("theme");
    } else {
      el.dataset.theme = theme;
      localStorage.setItem("theme", theme);
    }
  } catch {}
  for (const notify of listeners) notify();
}

// The <html> attribute is the store, so the header and drawer toggles stay in sync.
const listeners = new Set<() => void>();

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

function readTheme(): Theme {
  const forced = document.documentElement.dataset.theme;
  return forced === "light" || forced === "dark" ? forced : "system";
}

const serverTheme = (): Theme => "system";

function subscribeOs(notify: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", notify);
  return () => {
    query.removeEventListener("change", notify);
  };
}

function readOs(): "light" | "dark" {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

const serverOs = (): "light" | "dark" => "light";

export default function ThemeToggle({ showLabel }: { showLabel?: boolean }) {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);
  const os = useSyncExternalStore(subscribeOs, readOs, serverOs);
  // From System, force the side the OS is not giving, so every click changes the page.
  const next: Theme = theme === "system" ? (os === "dark" ? "light" : "dark") : "system";

  return (
    <Toggle
      type="button"
      onClick={() => applyTheme(next)}
      aria-label={`Theme: ${LABELS[theme]}. Switch to ${LABELS[next]}.`}
      $withLabel={showLabel}
    >
      <AutoFace aria-hidden>
        <AutoIcon />
      </AutoFace>
      <SunFace aria-hidden>
        <SunIcon />
      </SunFace>
      <MoonFace aria-hidden>
        <MoonIcon />
      </MoonFace>
      {showLabel ? <span>{LABELS[next]}</span> : null}
    </Toggle>
  );
}

function AutoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="6.4" stroke="currentColor" strokeWidth="2.2" />
      <path d="M9 2.6a6.4 6.4 0 0 0 0 12.8z" fill="currentColor" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M9 1.5V3M9 15V16.5M1.5 9H3M15 9H16.5M3.75 3.75L4.875 4.875M13.125 13.125L14.25 14.25M14.25 3.75L13.125 4.875M4.875 13.125L3.75 14.25"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* The face shows the next stop. CSS picks it because the server cannot read the OS
   preference, so a JS-picked face would flash. */
const Face = styled.span`
  display: none;
  line-height: 0;
`;

const AutoFace = styled(Face)`
  [data-theme] & {
    display: block;
  }
`;

const SunFace = styled(Face)`
  @media (prefers-color-scheme: dark) {
    display: block;
  }

  [data-theme] & {
    display: none;
  }
`;

const MoonFace = styled(Face)`
  @media (prefers-color-scheme: light) {
    display: block;
  }

  [data-theme] & {
    display: none;
  }
`;

const Toggle = styled.button<{ $withLabel?: boolean }>`
  ${iconButton};

  ${({ $withLabel }) =>
    $withLabel &&
    css`
      gap: 10px;
      width: 100%;
      height: auto;
      justify-content: flex-start;
      padding: 10px 14px;
      font-size: 15px;
      font-weight: ${fontWeight.semibold};
    `}
`;
