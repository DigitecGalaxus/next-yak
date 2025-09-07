import styles from "./page.module.css";

const items = [
  {
    q: "Is this production-ready?",
    a: "It’s an example demonstrating patterns, not a full product.",
  },
  {
    q: "How are styles organized?",
    a: "Global vars + shared modules + per-page CSS Modules.",
  },
  {
    q: "Can I extend this?",
    a: "Yes, add routes and reuse shared styles/components.",
  },
];

export default function FAQPage() {
  return (
    <div className={styles.container}>
      <h1>FAQ</h1>
      <div className={styles.qa}>
        {items.map((x) => (
          <div key={x.q}>
            <div className={styles.q}>{x.q}</div>
            <div className={styles.a}>{x.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
