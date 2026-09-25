import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { styled } from "next-yak";
import {
  getPostsNewestFirst,
  splitFeatured,
  readingMinutes,
  formatPostDate,
  type Post,
} from "@/lib/source";
import { pageMetadata } from "@/lib/page-metadata";
import { asset } from "@/lib/site";
import { sectionLabel } from "@/lib/mixins";
import { ArticleLayout, Title, Description } from "@/components/docs/page-layout";
import { PostTag } from "@/components/blog/post-tag";
import { fonts, fontSize, fontWeight, radii, screen, light, dark } from "@/tokens";

const description = "Notes on yak: the rename, the runtimes, and what is coming.";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description,
  path: "/blog",
  card: "blog",
});

export default async function BlogIndex() {
  const { featured, rest } = splitFeatured(getPostsNewestFirst());

  return (
    <ArticleLayout>
      <Title>Blog</Title>
      <Description>{description}</Description>
      {/* Every post can be a draft, and the production build drops drafts. */}
      {featured ? null : <Empty>No posts yet.</Empty>}
      {featured ? (
        <FeaturedCard href={featured.url}>
          <FeaturedText>
            <FeaturedLabels>
              <PostTag type={featured.data.type} />
              {featured.data.draft ? <DraftLabel>Draft</DraftLabel> : null}
            </FeaturedLabels>
            <FeaturedTitle>{featured.data.title}</FeaturedTitle>
            {featured.data.description ? <Blurb>{featured.data.description}</Blurb> : null}
            <PostMeta post={featured} withTag={false} />
            <ReadMore>Read the post →</ReadMore>
          </FeaturedText>
          <Mascot src={asset("/img/yak-jumping.png")} alt="" width="673" height="512" />
        </FeaturedCard>
      ) : null}
      {rest.length > 0 ? (
        <>
          <Divider>
            <h2>More posts, newest first</h2>
          </Divider>
          <Grid>
            {rest.map((post) => (
              <li key={post.url}>
                <Card href={post.url}>
                  {post.data.draft ? <DraftLabel>Draft</DraftLabel> : null}
                  <CardTitle>{post.data.title}</CardTitle>
                  {post.data.description ? <Blurb>{post.data.description}</Blurb> : null}
                  <PostMeta post={post} />
                </Card>
              </li>
            ))}
          </Grid>
        </>
      ) : null}
    </ArticleLayout>
  );
}

// The big card shows the tag above its title: on the date line of a wide card it floats mid-row.
async function PostMeta({ post, withTag = true }: { post: Post; withTag?: boolean }) {
  const minutes = await readingMinutes(post);
  return (
    <Meta>
      <span>
        <time dateTime={post.data.date}>{formatPostDate(post.data.date, "short")}</time> · {minutes}{" "}
        min read
      </span>
      {withTag ? <PostTag type={post.data.type} quiet /> : null}
    </Meta>
  );
}

// Only `next dev` renders drafts, so this label never reaches the deployed site.
const FeaturedLabels = styled.span`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DraftLabel = styled.span`
  ${sectionLabel};
  font-size: 11px;
`;

const Empty = styled.p`
  margin-top: 36px;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

// The same PressableCard card as the landing page buttons: a hard offset shadow that the card sinks into.
const PressableCard = styled(Link)`
  --card-offset: 4px;
  --card-edge: light-dark(${light.violet}, ${dark.edge});
  display: flex;
  border: 2.5px solid var(--card-edge);
  border-radius: ${radii.card};
  background: light-dark(${light.beige1}, ${dark.navy1});
  box-shadow: var(--card-offset) var(--card-offset) 0 0 var(--card-edge);
  color: light-dark(${light.violet}, ${dark.white});
  text-decoration: none;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform 0.08s ease,
      box-shadow 0.08s ease;
  }

  &:hover {
    transform: translate(2px, 2px);
    box-shadow: calc(var(--card-offset) - 2px) calc(var(--card-offset) - 2px) 0 0 var(--card-edge);
  }

  &:focus-visible {
    outline: none;
    --card-edge: light-dark(${light.red}, ${dark.red});
  }
`;

const FeaturedCard = styled(PressableCard)`
  align-items: center;
  gap: 24px;
  margin-top: 36px;
  padding: 28px 32px;
`;

const FeaturedText = styled.div`
  container: post / inline-size;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

const FeaturedTitle = styled.span`
  font-family: ${fonts.title};
  font-size: clamp(26px, 4vw, 34px);
  line-height: 1.15;
`;

const ReadMore = styled.span`
  margin-top: 4px;
  font-weight: ${fontWeight.bold};
  color: light-dark(${light.red}, ${dark.red});
`;

const Mascot = styled(Image)`
  flex: 0 0 auto;
  width: 160px;
  height: auto;

  @media (max-width: ${screen.nav}) {
    display: none;
  }
`;

// The big card is picked by `featured`, not by date, so the divider marks where the date order starts.
const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 48px;

  & h2 {
    ${sectionLabel};
    margin: 0;
    padding: 0;
    white-space: nowrap;
  }

  &::after {
    content: "";
    flex: 1;
    border-top: 2px dashed light-dark(${light.beige6}, ${dark.navy5});
  }
`;

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 20px;
  margin-top: 20px;
  padding: 0;
  list-style: none;
`;

const Card = styled(PressableCard)`
  container: post / inline-size;
  height: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 18px 20px;
`;

const CardTitle = styled.span`
  font-size: ${fontSize.h3};
  font-weight: ${fontWeight.bold};
  line-height: 1.3;
`;

const Blurb = styled.span`
  font-size: ${fontSize.small};
  line-height: 1.5;
  color: light-dark(${light.violetSoft}, ${dark.fog});
`;

// The date line with a grid tag needs about 315px. Below that the tag moves under the date in every
// card, so a short tag does not stay on the line while a long one wraps.
const Meta = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  align-self: stretch;
  margin-top: auto;
  padding-top: 6px;
  font-family: ${fonts.mono};
  font-size: 13px;
  letter-spacing: 0.3px;
  color: light-dark(${light.violetSoft}, ${dark.fog});

  @container post (max-width: 320px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
