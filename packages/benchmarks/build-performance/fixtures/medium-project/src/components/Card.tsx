import styles from "./Card.module.css";

export type CardProps = {
  title: string;
  description: string;
  href?: string;
};

export default function Card({ title, description, href }: CardProps) {
  const content = (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <p className={styles.desc}>{description}</p>
    </div>
  );
  if (href) {
    return (
      <a href={href} aria-label={title}>
        {content}
      </a>
    );
  }
  return content;
}
