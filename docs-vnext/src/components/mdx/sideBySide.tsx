import { styled } from "next-yak";
import { container, syntax } from "@/tokens";

export const SideBySide = styled.div`
  display: grid;
  /* not 1fr: a 1fr column cannot shrink below its longest code line */
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;

  @container prose (max-width: ${container.prose.sideBySide}) {
    grid-template-columns: minmax(0, 1fr);
  }

  & > div > :first-child {
    margin-top: 0;
  }

  /* linked parts from lib/code-links.ts: hovering one highlights all parts with its key */
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
