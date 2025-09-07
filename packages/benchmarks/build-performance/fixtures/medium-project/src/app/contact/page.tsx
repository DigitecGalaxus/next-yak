import styles from "./page.module.css";
import Alert from "@/components/Alert";
import Button from "@/components/Button";

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <h1>Contact</h1>
      <Alert variant="info">We usually respond within 1–2 business days.</Alert>
      <form className={styles.form}>
        <input className={styles.input} placeholder="Your email" />
        <textarea className={styles.input} placeholder="Message" rows={4} />
        <Button variant="primary" size="md" className={styles.button}>
          Send
        </Button>
      </form>
    </div>
  );
}
