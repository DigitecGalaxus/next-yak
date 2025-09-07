import marketing from "@/styles/marketing.module.css";
import styles from "./page.module.css";
import Card from "@/components/Card";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <header className={marketing.hero}>
        <h1 className={styles.title}>About Us</h1>
        <p className={styles.lead}>
          We build fast, accessible, and delightful web experiences. This
          example shows shared styles and components across pages.
        </p>
      </header>
      <section className={marketing.grid}>
        <Card
          title="Mission"
          description="Empower developers with simple, scalable tooling."
        />
        <Card
          title="Values"
          description="Performance, accessibility, and great developer experience."
        />
        <Card
          title="Culture"
          description="Remote-first, async-friendly, and customer-obsessed."
        />
      </section>
    </div>
  );
}
