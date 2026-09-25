import { styled } from "next-yak";
import { overline } from "@/lib/mixins";
import { light, dark, status } from "@/tokens";

export type PostType = "announcement" | "release" | "deep-dive" | "guide";

const LABELS: Record<PostType, string> = {
  announcement: "Announcement",
  release: "Release",
  "deep-dive": "Deep dive",
  guide: "Guide",
};

// `quiet` drops the fill for lists, where a filled pill on every card competes with the titles.
export function PostTag({ type, quiet = false }: { type: PostType; quiet?: boolean }) {
  return (
    <Tag data-type={type} data-quiet={quiet || undefined}>
      {LABELS[type]}
    </Tag>
  );
}

// The hue only tints the fill and the dot. The text keeps the page color, so it reads in both themes.
const Tag = styled.span`
  ${overline};
  --tag-hue: light-dark(${light.violet}, ${dark.fog});
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: 0.8px;
  color: light-dark(${light.violet}, ${dark.white});
  background: color-mix(in srgb, var(--tag-hue) 16%, transparent);

  &[data-quiet] {
    padding: 0;
    color: light-dark(${light.violetSoft}, ${dark.fog});
    background: none;
  }

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--tag-hue);
  }

  &[data-type="announcement"] {
    --tag-hue: light-dark(${light.red}, ${dark.red});
  }

  &[data-type="release"] {
    --tag-hue: ${status.success};
  }

  &[data-type="guide"] {
    --tag-hue: ${status.info};
  }
`;
