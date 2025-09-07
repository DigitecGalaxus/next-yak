import styles from "./page.module.css";
import Card from "@/components/Card";

export default function PricingPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pricing</h1>
      <p className={styles.note}>
        Simple, predictable pricing for projects of any size.
      </p>
      <div className={styles.plans}>
        <Card title="Free" description="All essentials to get started. $0/mo" />
        <Card
          title="Pro"
          description="Advanced features for growing teams. $19/mo"
        />
        <Card
          title="Enterprise"
          description="Security and support at scale. Contact us"
        />
      </div>
    </div>
  );
}
