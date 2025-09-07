import blog from "@/styles/blog.module.css";
import styles from "./page.module.css";
import Link from "next/link";
import Badge from "@/components/Badge";

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
    <div className={styles.container}>
      <h1 className={styles.title}>Blog</h1>
      <div className={blog.list}>
        {posts.map((p) => (
          <div className={blog.item} key={p.slug}>
            <Link href={`/blog/${p.slug}`}>
              <div className={blog.post}>
                <strong>{p.title}</strong>
                <span className={blog.meta}>{p.date}</span>
                <Badge variant={p.tag}> {p.tag} </Badge>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
