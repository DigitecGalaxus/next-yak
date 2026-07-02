"use client";

import { useEffect, useState } from "react";
import { css, styled } from "next-yak";
import { fontWeight } from "@/tokens";
import { iconButton } from "./button";

type Theme = "light" | "dark" | "system";
type SettableTheme = Exclude<Theme, "system">;
const ORDER: SettableTheme[] = ["light", "dark"];
const LABELS: Record<SettableTheme, string> = { light: "Light", dark: "Dark" };

// Default is "system" (follows the OS); "light"/"dark" force a theme. Forcing sets data-theme on <html>
function applyTheme(theme: SettableTheme) {
  const el = document.documentElement;
  el.dataset.theme = theme;
}

export default function ThemeToggle({ showLabel }: { showLabel?: boolean }) {
  const [theme, setTheme] = useState<Theme>("system");
  const nextTheme = theme === "light" ? "dark" : "light";

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  function cycle() {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {}
  }

  return (
    <Toggle
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${theme}. Click to switch.`}
      $withLabel={showLabel}
    >
      {nextTheme === "light" ? <SunIcon /> : <MoonIcon />}
      {showLabel ? <span>{LABELS[nextTheme]}</span> : null}
    </Toggle>
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
