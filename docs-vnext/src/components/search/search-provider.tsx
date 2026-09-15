"use client";

import { createContext, use, useEffect, useMemo, useState } from "react";
import SearchDialog from "./search-dialog";

type SearchContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

/**
 * Owns the search dialog's open state, registers the global keyboard shortcuts
 * (⌘K / Ctrl+K to toggle, `/` to open when not typing), renders the dialog, and
 * exposes `useSearch()` so any trigger (e.g. the header button) can open it.
 */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      } else if (event.key === "/" && !isEditableTarget(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <SearchContext value={value}>
      {children}
      <SearchDialog open={open} onOpenChange={setOpen} />
    </SearchContext>
  );
}

export function useSearch() {
  const context = use(SearchContext);
  if (!context) throw new Error("useSearch must be used within <SearchProvider>");
  return context;
}

// Don't hijack `/` while the user is typing in a field or contenteditable.
function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}
