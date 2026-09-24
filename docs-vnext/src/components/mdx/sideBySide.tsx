import { styled } from "next-yak";
import { ReactNode } from "react";
import { container, syntax } from "@/tokens";

export const SideBySide = ({ children }: { children: ReactNode }) => {
  return <Grid>{children}</Grid>;
};

const Grid = styled.div`
  display: grid;
  /* minmax(0, …), not 1fr: a 1fr column never gets narrower than its longest code line,
     so one long output line pushed the grid past the prose column and over the TOC. Now
     each half keeps its share and a long line scrolls inside its own code block. */
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;

  /* keys off the prose column's width (Content sets container: prose), not the viewport,
     so it stacks in a narrow docs column even on a wide screen */
  @container prose (max-width: ${container.prose.sideBySide}) {
    grid-template-columns: minmax(0, 1fr);
  }

  & > div > :first-child {
    margin-top: 0;
  }

  /* Linked hover (lib/code-links.ts): a marked part has a dotted underline in its key's
     colour. Hovering one lights up every part with the same key in both blocks, so the
     reader sees which output came from which input. :has() does it without script. */
  [data-link] {
    border-radius: 3px;
    text-decoration: underline dotted color-mix(in srgb, var(--link) 70%, transparent);
    text-underline-offset: 4px;

    @media (prefers-reduced-motion: no-preference) {
      transition: background 0.12s ease;
    }
  }

  [data-link="1"] {
    --link: ${syntax.keyword};
  }
  [data-link="2"] {
    --link: ${syntax.type};
  }
  [data-link="3"] {
    --link: ${syntax.func};
  }
  [data-link="4"] {
    --link: ${syntax.property};
  }
  [data-link="5"] {
    --link: ${syntax.constant};
  }
  [data-link="6"] {
    --link: ${syntax.string};
  }

  &:has([data-link="1"]:hover) [data-link="1"],
  &:has([data-link="2"]:hover) [data-link="2"],
  &:has([data-link="3"]:hover) [data-link="3"],
  &:has([data-link="4"]:hover) [data-link="4"],
  &:has([data-link="5"]:hover) [data-link="5"],
  &:has([data-link="6"]:hover) [data-link="6"] {
    background: color-mix(in srgb, var(--link) 28%, transparent);
    text-decoration-style: solid;
    text-decoration-color: var(--link);
  }
`;
