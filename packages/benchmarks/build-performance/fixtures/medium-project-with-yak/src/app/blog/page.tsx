import Link from "next/link";
import Badge from "@/components/Badge";
import { styled } from "next-yak";
import { Item, List, Meta, Post } from "@/styles/blog";
import { spacings } from "@/styles/spacings.yak";
import { fontSizes } from "@/styles/font";

const posts = [
  {
    slug: "post-1",
    title: "Building a multi-page Next.js example",
    date: "2025-09-01",
    tag: "success" as const,
  },
  {
    slug: "post-3",
    title: "Sharing styles with CSS Modules",
    date: "2025-09-03",
    tag: "info" as const,
  },
];

export default function BlogIndexPage() {
  return (
    <Container>
      <Title>Blog</Title>
      <List>
        {posts.map((p) => (
          <Item key={p.slug}>
            <Link href={`/blog/${p.slug}`}>
              <Post>
                <strong>{p.title}</strong>
                <Meta>{p.date}</Meta>
                <Badge variant={p.tag}> {p.tag} </Badge>
              </Post>
            </Link>
          </Item>
        ))}
      </List>
    </Container>
  );
}

const Container = styled.div`
  padding: ${spacings[24]};
  display: grid;
  gap: ${spacings[16]};
`;

const Title = styled.h1`
  font-size: ${fontSizes.lg};
  font-weight: 700;
`;
