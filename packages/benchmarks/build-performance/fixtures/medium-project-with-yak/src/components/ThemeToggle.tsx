"use client";

import { useEffect, useState } from "react";
import { styled } from "next-yak";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      localStorage.getItem("theme")) as "light" | "dark" | null;
    const initial =
      saved ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(initial);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  return (
    <Toggle
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      aria-label="Toggle theme"
      type="button"
    >
      {theme === "light" ? "🌞 Light" : "🌚 Dark"}
    </Toggle>
  );
}

const Toggle = styled.button`
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-fg);
  border-radius: var(--radius-full);
  height: 32px;
  padding: 0 10px;

  &:hover {
    background: var(--color-surface-hover);
  }
`;
