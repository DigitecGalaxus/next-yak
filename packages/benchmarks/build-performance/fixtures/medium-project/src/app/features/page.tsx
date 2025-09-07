import marketing from "@/styles/marketing.module.css";
import styles from "./page.module.css";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Alert from "@/components/Alert";

const features = [
  {
    title: "Fast Builds",
    description: "Optimized config with modern Next.js app router.",
  },
  {
    title: "Type Safe",
    description: "TypeScript strict mode with helpful patterns.",
  },
  {
    title: "Shared Styles",
    description: "CSS Modules plus scoped shared style sheets.",
  },
  {
    title: "Reusable UI",
    description: "Simple Card and Nav components used across pages.",
  },
  {
    title: "SEO Ready",
    description: "Metadata and semantic markup out of the box.",
  },
  {
    title: "Dark Mode",
    description: "Respects user color-scheme via CSS variables.",
  },
];

export default function FeaturesPage() {
  return (
    <div className={styles.container}>
      <header className={marketing.hero}>
        <h1 className={styles.title}>Features</h1>
        <p className={styles.gridNote}>
          A sampling of what this example demonstrates.
        </p>
        <div>
          <Button variant="primary" size="md">
            Get Started
          </Button>
          <span style={{ marginLeft: 8 }} />
          <Button variant="ghost" size="md" href="/pricing">
            See Pricing
          </Button>
        </div>
      </header>
      <section className={marketing.grid}>
        {features.map((f) => (
          <Card key={f.title} title={f.title} description={f.description} />
        ))}
      </section>
      <section className={marketing.section}>
        <Alert title="Pro tip" variant="success">
          Use CSS variables to express themes, then consume via modules.
        </Alert>
      </section>
    </div>
  );
}
