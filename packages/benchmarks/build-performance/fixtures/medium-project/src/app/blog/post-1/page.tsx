import blog from "@/styles/blog.module.css";
import styles from "./page.module.css";

export default function BlogPostOne() {
  return (
    <article className={styles.container}>
      <h1 className={styles.title}>Building a multi-page Next.js example</h1>
      <p className={blog.meta}>2025-09-01 • 3 min read</p>
      <div className={styles.content}>
        <p>
          This post demonstrates how multiple pages can reuse shared components
          and styles while keeping each page’s CSS scoped via modules.
        </p>
        <p>
          Marketing pages share a grid/hero stylesheet, while blog pages share a
          list/post stylesheet. Global variables in globals.css provide
          color-scheme and base resets.
        </p>
      </div>
    </article>
  );
}
