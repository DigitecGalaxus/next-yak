import { styled } from "next-yak";
import { EXTERNAL_LINK_HINT } from "@/lib/external-link";
import { visuallyHidden } from "@/lib/mixins";

export default function ExternalMark() {
  return (
    <>
      <Mark viewBox="0 0 10 10" aria-hidden="true">
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
  /* global.css sets svg to display: block, which would break the text flow */
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  margin-left: 0.35em;
  vertical-align: 0.14em;
  stroke-width: 1.5;
`;

const Hint = styled.span`
  ${visuallyHidden};
`;
