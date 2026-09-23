import { styled } from "next-yak";
import { EXTERNAL_LINK_HINT } from "@/lib/external-link";
import { visuallyHidden } from "@/lib/mixins";

/**
 * The mark after a link that leaves the site: an arrow for the eye, and the hint text for
 * a screen reader. One component, so the two never drift apart.
 *
 * The arrow draws in currentColor at full strength, which keeps it the same colour as the
 * label in front of it in every state, including the red a link takes on hover. It sizes
 * itself in em, so the 16px nav entry and the 14px bold mono link both get an arrow that
 * fits their text.
 */
export default function ExternalMark({ className }: { className?: string }) {
  return (
    <>
      <Mark viewBox="0 0 10 10" aria-hidden="true" className={className}>
        <path
          d="M1.6 8.4L8.4 1.6M4 1.6H8.4V6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Mark>
      <Hint>{EXTERNAL_LINK_HINT}</Hint>
    </>
  );
}

const Mark = styled.svg`
  /* global.css resets every svg to display: block, which drops the arrow onto its own line
     and makes vertical-align do nothing. The arrow has to stay in the text flow. */
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  margin-left: 0.35em;
  /* off the baseline, so the arrow sits in the cap band of the label */
  vertical-align: 0.14em;
  /* One stroke everywhere, matched to the stem of the nav label. A heavier stroke beside
     the bold mono link turned the head into a blob. */
  stroke-width: 1.5;
`;

const Hint = styled.span`
  ${visuallyHidden};
`;
